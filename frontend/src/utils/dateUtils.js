 export const formatRelativeTime = (isoString) => {
        const date = new Date(isoString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        const intervals = {
            year: 31536000,
            month: 2592000,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60,
            second: 1
        };

        for (const [unit, seconds] of Object.entries(intervals)) {
            const interval = Math.floor(diffInSeconds / seconds);
            if (interval >= 1) {
                return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
            }
        }
        return "just now";
    };



    export const formatJoinDate = (isoString) => {
    // 1. Check if the value is missing completely
    if (!isoString) return "Unknown date";
    
    const date = new Date(isoString);
    
    // 2. Check if the value was passed but is an invalid date format
    if (isNaN(date.getTime())) return "Unknown date";

    // 3. Safely format the valid date
    return new Intl.DateTimeFormat('en-US', { 
        month: 'long', 
        year: 'numeric' 
    }).format(date);
};