import React, { useState, useEffect } from 'react';

// --- MOCK DATA ---
const MOCK_LEADERBOARD = [
    { _id: '1', profileName: 'sneha_dev', profileUrl: 'https://i.pravatar.cc/150?u=sneha', completedSparks: 142 },
    { _id: '2', profileName: 'shubham', profileUrl: 'https://i.pravatar.cc/150?u=shubham', completedSparks: 128 },
    { _id: '3', profileName: 'vikram_system', profileUrl: 'https://i.pravatar.cc/150?u=vikram', completedSparks: 115 },
    { _id: '4', profileName: 'priya_ux', profileUrl: 'https://i.pravatar.cc/150?u=priya', completedSparks: 94 },
    { _id: '5', profileName: 'aryan_codes', profileUrl: 'https://i.pravatar.cc/150?u=aryan', completedSparks: 87 },
    { _id: '6', profileName: 'karan_ui', profileUrl: 'https://i.pravatar.cc/150?u=karan', completedSparks: 62 },
];

export const Leaderboard = () => {
    const [leaders, setLeaders] = useState(MOCK_LEADERBOARD);
    const [isLoading, setIsLoading] = useState(false);


    useEffect(() => {
        const fetchLeaderboard = async () => {
            setIsLoading(true);
            try {
                const res = await fetch('http://localhost:5000/api/leaderboard', { credentials: 'include' });
                const data = await res.json();
                setLeaders(data);
            } catch (error) {
                console.error("Failed to load leaderboard", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen py-20 animate-in fade-in">
                <svg className="animate-spin h-10 w-10 text-orange-500 mb-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-sm font-medium text-gray-500">Calculating ranks...</p>
            </div>
        );
    }

    const topThree = leaders.slice(0, 3);
    const theRest = leaders.slice(3);

    // Reusable Trophy SVG for the podium steps
    const TrophyIcon = ({ className }) => (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75v1.5a5.002 5.002 0 014.153 3.655 2.25 2.25 0 01-.89 2.502l-1.397 1.048c-.524.393-.836 1.002-.836 1.652v1.143a1.5 1.5 0 01-1.5 1.5H9.72a1.5 1.5 0 01-1.5-1.5v-1.143c0-.65-.312-1.26-.836-1.652L6.002 10.41a2.25 2.25 0 01-.89-2.503 5.002 5.002 0 014.138-3.655V2.75A.75.75 0 0110 2z" clipRule="evenodd" />
        </svg>
    );

    return (
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 min-h-screen animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header */}
            <div className="text-center mb-12">
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">Top Challengers</h1>
                <p className="mt-2 text-sm sm:text-base text-gray-500">Ranked by successfully completed Sparks.</p>
            </div>

            {/* --- PODIUM (Top 3) --- */}
            {topThree.length >= 3 && (
                <div className="flex flex-row items-end justify-center gap-2 sm:gap-6 mb-12 h-64">

                    {/* Rank 2 (Silver) */}
                    <div className="flex flex-col items-center pb-4 animate-in slide-in-from-bottom-8 duration-700 delay-100">
                        <div className="relative mb-2">
                            <img src={topThree[1].profileUrl} alt={topThree[1].profileName} className="h-16 w-16 sm:h-20 sm:w-20 rounded-full object-cover ring-4 ring-gray-200 shadow-lg" />
                        </div>
                        <h3 className="text-sm sm:text-base font-bold text-gray-900 mt-2">@{topThree[1].profileName}</h3>
                        <p className="text-xs sm:text-sm font-semibold text-orange-600">{topThree[1].completedSparks} Sparks</p>
                        {/* Silver Pillar with Embedded Trophy */}
                        <div className="mt-3 w-20 sm:w-24 h-24 bg-gradient-to-t from-gray-200 to-gray-50 rounded-t-xl border-t border-x border-gray-300 flex flex-col items-center justify-center shadow-inner">
                            <TrophyIcon className="h-8 w-8 text-gray-400 drop-shadow-sm" />
                            <span className="text-gray-500 font-bold text-sm mt-1">2nd</span>
                        </div>
                    </div>

                    {/* Rank 1 (Gold) */}
                    <div className="flex flex-col items-center z-10 animate-in slide-in-from-bottom-12 duration-700">
                        <div className="relative mb-2">
                            <img src={topThree[0].profileUrl} alt={topThree[0].profileName} className="h-20 w-20 sm:h-24 sm:w-24 rounded-full object-cover ring-4 ring-yellow-400 shadow-xl" />
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mt-2">@{topThree[0].profileName}</h3>
                        <p className="text-sm font-bold text-orange-600">{topThree[0].completedSparks} Sparks</p>
                        {/* Gold Pillar with Embedded Trophy */}
                        <div className="mt-3 w-24 sm:w-28 h-32 bg-gradient-to-t from-yellow-100 to-yellow-50 rounded-t-xl border-t border-x border-yellow-300 flex flex-col items-center justify-center shadow-inner">
                            <TrophyIcon className="h-10 w-10 text-yellow-500 drop-shadow-md" />
                            <span className="text-yellow-600 font-extrabold text-base mt-1">1st</span>
                        </div>
                    </div>

                    {/* Rank 3 (Bronze) */}
                    <div className="flex flex-col items-center pb-4 animate-in slide-in-from-bottom-8 duration-700 delay-200">
                        <div className="relative mb-2">
                            <img src={topThree[2].profileUrl} alt={topThree[2].profileName} className="h-16 w-16 sm:h-20 sm:w-20 rounded-full object-cover ring-4 ring-orange-200 shadow-lg" />
                        </div>
                        <h3 className="text-sm sm:text-base font-bold text-gray-900 mt-2">@{topThree[2].profileName}</h3>
                        <p className="text-xs sm:text-sm font-semibold text-orange-600">{topThree[2].completedSparks} Sparks</p>
                        {/* Bronze Pillar with Embedded Trophy */}
                        <div className="mt-3 w-20 sm:w-24 h-16 bg-gradient-to-t from-orange-100 to-orange-50 rounded-t-xl border-t border-x border-orange-200 flex flex-col items-center justify-center shadow-inner">
                            <TrophyIcon className="h-6 w-6 text-orange-400 drop-shadow-sm" />
                            <span className="text-orange-500 font-bold text-xs mt-1">3rd</span>
                        </div>
                    </div>
                </div>
            )}

            {/* --- THE REST OF THE LIST --- */}
            <div className="flex flex-col gap-3">
                {theRest.map((user, index) => (
                    <div
                        key={user._id}
                        className="flex items-center justify-between p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 group"
                    >
                        <div className="flex items-center gap-4 sm:gap-6">
                            <span className="text-lg font-bold text-gray-400 w-6 text-center group-hover:text-orange-500 transition-colors">
                                {index + 4}
                            </span>

                            <div className="flex items-center gap-3 sm:gap-4">
                                <img src={user.profileUrl} alt={user.profileName} className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover ring-2 ring-gray-50" />
                                <div>
                                    <h4 className="text-sm sm:text-base font-bold text-gray-900 tracking-tight">@{user.profileName}</h4>
                                </div>
                            </div>
                        </div>

                        <div className="bg-orange-50 px-4 py-1.5 rounded-full">
                            <span className="text-sm font-bold text-orange-700">{user.completedSparks}</span>
                            <span className="text-xs font-medium text-orange-600/70 ml-1 hidden sm:inline">Sparks</span>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
};