// utils/streakUtils.js
const User = require('../models/User');

const updateStreak = async (userId) => {
    const user = await User.findById(userId);
    if (!user) return;

    const now = new Date();
    // Normalize both dates to midnight (00:00:00) to easily compare calendar days
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let lastCompleted = null;
    if (user.lastSparkCompletedAt) {
        const last = new Date(user.lastSparkCompletedAt);
        lastCompleted = new Date(last.getFullYear(), last.getMonth(), last.getDate());
    }

    // 1. If this is their first spark ever
    if (!lastCompleted) {
        user.currentStreak = 1;
        user.longestStreak = 1;
        user.lastSparkCompletedAt = now;
        await user.save();
        return user;
    }

    // Calculate the difference in days
    const diffTime = Math.abs(today - lastCompleted);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        // 2. They already completed a spark today. Streak stays the same.
        // We just update the timestamp to the most recent one.
        user.lastSparkCompletedAt = now;
    } 
    else if (diffDays === 1) {
        // 3. They completed one yesterday! The streak continues.
        user.currentStreak += 1;
        if (user.currentStreak > user.longestStreak) {
            user.longestStreak = user.currentStreak;
        }
        user.lastSparkCompletedAt = now;
    } 
    else {
        // 4. They missed a day (diffDays > 1). The streak resets.
        user.currentStreak = 1;
        user.lastSparkCompletedAt = now;
    }

    await user.save();
    return user;
};

module.exports = { updateStreak };