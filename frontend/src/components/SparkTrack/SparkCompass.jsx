import React, { useState } from 'react';

export const SparkCompass = ({ onTrackCreated }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        topic: '',
        difficulty: 'Beginner',
        days: '7'
    });

    const handleGenerateTrack = async (e) => {
        e.preventDefault();
        if (!formData.topic.trim()) return;

        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch('http://localhost:5000/api/tracks/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    topic: formData.topic,
                    difficulty: formData.difficulty,
                    totalDays: formData.days
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to generate track.");
            }

            // Pass the entire completed track document to the parent component (e.g., FeedLayout or Dashboard)
            if (onTrackCreated) {
                onTrackCreated(data.track);
            }

            // Reset form for the next idea
            setFormData({ topic: '', difficulty: 'Beginner', days: '7' });

        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // LOADING STATE
    if (isLoading) {
        return (
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 flex flex-col items-center justify-center text-center h-auto min-h-[250px] animate-in fade-in">
                <svg className="animate-spin h-8 w-8 text-orange-500 mb-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <h3 className="font-bold text-gray-900">Designing Curriculum...</h3>
                <p className="text-xs text-gray-500 mt-1">Generating your custom AI roadmap</p>
            </div>
        );
    }

    // FORM STATE
    return (
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
            <div className="flex items-center gap-2 mb-1">
                <svg className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <h3 className="font-bold text-gray-900 text-lg">Spark Compass</h3>
            </div>
            <p className="text-xs text-gray-500 mb-5">Set a goal. We'll generate a daily video-challenge roadmap to get you there.</p>

            <form onSubmit={handleGenerateTrack} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">What do you want to learn?</label>
                    <input
                        type="text"
                        required
                        value={formData.topic}
                        onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                        placeholder="e.g. System Design, Figma UI..."
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm px-3 py-2 border"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Difficulty</label>
                        <select
                            value={formData.difficulty}
                            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm px-2 py-2 border bg-white text-gray-700"
                        >
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Duration</label>
                        <select
                            value={formData.days}
                            onChange={(e) => setFormData({ ...formData, days: e.target.value })}
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm px-2 py-2 border bg-white text-gray-700"
                        >
                            <option value="3">3 Days</option>
                            <option value="7">7 Days</option>
                            <option value="14">14 Days</option>
                        </select>
                    </div>
                </div>

                {error && (
                    <div className="text-xs font-bold text-red-500 bg-red-50 p-2 rounded-lg border border-red-100">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    className="w-full rounded-xl bg-orange-50 px-4 py-2.5 text-sm font-bold text-orange-600 shadow-sm hover:bg-orange-100 border border-orange-200 transition-colors"
                >
                    Generate Path
                </button>
            </form>
        </div>
    );
};