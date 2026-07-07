const SparkTrack = require('../models/SparkTrack');

let GoogleGenerativeAI;
let genAI;

try {
    const generativeAI = require("@google/generative-ai");
    GoogleGenerativeAI = generativeAI.GoogleGenerativeAI;
    if (process.env.GEMINI_API_KEY) {
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
} catch (error) {
    console.error("WARNING: @google/generative-ai module is not installed. AI features will be disabled.", error.message);
}

/**
 * @desc    Generate a new personalized learning Spark Track using AI
 * @route   POST /api/tracks/generate
 * @access  Private
 */
const generateSparkTrack = async (req, res) => {
    try {
        if (!GoogleGenerativeAI) {
            return res.status(500).json({ 
                error: "AI features are currently unavailable (missing '@google/generative-ai' library). Please check container logs and rebuild." 
            });
        }
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ 
                error: "GEMINI_API_KEY is not configured in the backend environment." 
            });
        }
        if (!genAI) {
            genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        }

        const tracks = SparkTrack.find({userId:req.user._id});

        const { topic, difficulty, totalDays } = req.body;
        const userId = req.user.id;

        // 1. Validation Safeguards
        if (!topic || !difficulty || !totalDays) {
            return res.status(400).json({ error: "Please provide a topic, difficulty, and total days." });
        }

        const daysNum = parseInt(totalDays);
        if (isNaN(daysNum) || daysNum < 1 || daysNum > 30) {
            return res.status(400).json({ error: "Duration must be a number between 1 and 30 days." });
        }

        // 2. Check if the user already has an active track for this identical topic
        const existingTrack = await SparkTrack.findOne({ userId, topic, isCompleted: false });
        if (existingTrack) {
            return res.status(400).json({
                error: "You already have an active learning path for this topic! Complete or abandon it first."
            });
        }

        // 3. Configure the AI Model with System Rules
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: `You are an expert curriculum designer and challenge creator for "Takshar," a video-based social learning platform. 
Your job is to generate a progressive, multi-day learning roadmap based on a user's requested topic and difficulty.

CRITICAL RULES:
1. Every day must contain a specific, actionable challenge (a "Spark").
2. The user must be able to prove they completed the challenge by uploading a short video (e.g., a screen recording of their code, a video of them speaking, a physical demonstration). 
3. Do not give them reading assignments. Give them "doing" assignments.
4. Output your response STRICTLY as a raw JSON array. Do not include markdown blocks (like \`\`\`json), conversational text, or explanations. Just the raw JSON.

EXPECTED JSON SCHEMA:
[
  {
    "day": 1,
    "title": "Short catchy title",
    "description": "Clear, 2-3 sentence instruction on what they must build, do, or demonstrate on camera today."
  }
]`
        });

        // 4. Fire the prompt to Gemini
        const prompt = `Generate a ${daysNum}-day roadmap for the topic "${topic}" at a "${difficulty}" difficulty level.`;
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // 5. Clean and Parse the JSON safely
        let parsedRoadmap;
        try {
            // Removes markdown formatting if the AI ignores the system prompt
            const cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
            parsedRoadmap = JSON.parse(cleanJson);
        } catch (parseError) {
            console.error("Gemini output formatting error. Raw text was:", responseText);
            return res.status(500).json({ error: "The AI generated an invalid data format. Please try again." });
        }

        // 6. Initialize Day 1 status to 'Active' and the rest stay 'Locked'
        const processedRoadmap = parsedRoadmap.map((item) => ({
            day: item.day,
            title: item.title,
            description: item.description,
            status: item.day === 1 ? 'Active' : 'Locked',
            videoSubmissionUrl: null,
            completedAt: null
        }));

        // 7. Save the whole pipeline to MongoDB
        const newTrack = await SparkTrack.create({
            userId,
            topic,
            difficulty,
            totalDays: daysNum,
            currentDay: 1,
            isCompleted: false,
            currentStreak: 0,
            lastActivityAt: new Date(),
            roadmap: processedRoadmap
        });

        // 8. Return response to the frontend client
        res.status(201).json({
            message: "Spark Track generated successfully!",
            track: newTrack
        });

    } catch (error) {
        console.error("Track Generation Controller Error:", error);
        res.status(500).json({ error: "Internal server error while generating your learning path." });
    }
};

//  1. Fetch all tracks for the logged-in user
const getUserTracks = async (req, res) => {
    try {
        // Find all tracks and sort by newest first
        const tracks = await SparkTrack.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(tracks);
    } catch (error) {
        console.error("Fetch Tracks Error:", error);
        res.status(500).json({ error: "Failed to fetch your Spark Tracks." });
    }
};

// 2. Submit a video for a specific day
const submitTrackSpark = async (req, res) => {
    try {
        const { trackId } = req.params;
        const { day, videoUrl } = req.body; // URL received after Cloudinary upload

        if (!videoUrl) {
            return res.status(400).json({ error: "Video URL is required to complete a spark." });
        }

        const track = await SparkTrack.findOne({ _id: trackId, userId: req.user.id });
        if (!track) return res.status(404).json({ error: "Track not found." });

        // Find the specific day in the roadmap array
        const dayIndex = track.roadmap.findIndex(r => r.day === parseInt(day));
        if (dayIndex === -1) return res.status(404).json({ error: "Invalid day for this track." });

        if (track.roadmap[dayIndex].status === 'Locked') {
            return res.status(400).json({ error: "You cannot submit a spark for a locked day." });
        }

        // 1. Update the current day's status
        track.roadmap[dayIndex].videoSubmissionUrl = videoUrl;
        track.roadmap[dayIndex].status = 'Completed';
        track.roadmap[dayIndex].completedAt = new Date();

        // 2. Progression Logic (If they just completed their *active* day)
        if (track.currentDay === parseInt(day)) {
            track.lastActivityAt = new Date();
            track.currentStreak += 1;

            // If there are more days left, unlock the next one
            if (track.currentDay < track.totalDays) {
                track.currentDay += 1;
                const nextDayIndex = track.roadmap.findIndex(r => r.day === track.currentDay);
                if (nextDayIndex !== -1) {
                    track.roadmap[nextDayIndex].status = 'Active';
                }
            } else {
                // They finished the entire track!
                track.isCompleted = true;
            }
        }

        await track.save();
        res.status(200).json({ message: "Spark submitted successfully!", track });

    } catch (error) {
        console.error("Submit Track Error:", error);
        res.status(500).json({ error: "Failed to submit spark." });
    }
};

module.exports = {
    generateSparkTrack,
    getUserTracks,
    submitTrackSpark
};