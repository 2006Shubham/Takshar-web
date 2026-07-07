import React, { useState, useEffect } from 'react';

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
        if (Array.isArray(data) && data.length > 0) {
          setLeaders(data);
        }
      } catch (error) {
        console.error('Failed to load leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <svg className="animate-spin h-8 w-8 text-orange-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="mt-3 text-sm font-medium text-gray-400">Calculating ranks…</p>
      </div>
    );
  }

  const topThree = leaders.slice(0, 3);
  const theRest = leaders.slice(3);

  // Podium order: 2nd, 1st, 3rd
  const podiumOrder = [topThree[1], topThree[0], topThree[2]];
  const podiumConfig = [
    { rank: 2, label: '2nd', height: 'h-24', ringClass: 'ring-gray-300', pillarGrad: 'from-gray-200 to-gray-100', textClass: 'text-gray-500', avatarSize: 'h-16 w-16', trophyColor: 'text-gray-400' },
    { rank: 1, label: '1st', height: 'h-36', ringClass: 'ring-yellow-400', pillarGrad: 'from-yellow-200 to-yellow-50', textClass: 'text-yellow-600', avatarSize: 'h-20 w-20', trophyColor: 'text-yellow-500' },
    { rank: 3, label: '3rd', height: 'h-16', ringClass: 'ring-orange-300', pillarGrad: 'from-orange-200 to-orange-50', textClass: 'text-orange-500', avatarSize: 'h-14 w-14', trophyColor: 'text-orange-400' },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 min-h-screen">

      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-50 mb-4">
          <svg className="h-6 w-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75v1.5a5.002 5.002 0 014.153 3.655 2.25 2.25 0 01-.89 2.502l-1.397 1.048c-.524.393-.836 1.002-.836 1.652v1.143a1.5 1.5 0 01-1.5 1.5H9.72a1.5 1.5 0 01-1.5-1.5v-1.143c0-.65-.312-1.26-.836-1.652L6.002 10.41a2.25 2.25 0 01-.89-2.503 5.002 5.002 0 014.138-3.655V2.75A.75.75 0 0110 2z" clipRule="evenodd" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Top Challengers</h1>
        <p className="mt-2 text-sm text-gray-500">Ranked by completed Sparks this month.</p>
      </div>

      {/* Podium */}
      {topThree.length >= 3 && (
        <div className="flex items-end justify-center gap-4 mb-10">
          {podiumOrder.map((user, idx) => {
            if (!user) return null;
            const cfg = podiumConfig[idx];
            return (
              <div key={user._id} className="flex flex-col items-center" style={{ minWidth: 96 }}>
                {/* Crown for #1 */}
                {cfg.rank === 1 && (
                  <div className="mb-1">
                    <svg className="h-6 w-6 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M2 19l2-9 5 5 3-8 3 8 5-5 2 9H2z" />
                    </svg>
                  </div>
                )}
                <img
                  src={user.profileUrl}
                  alt={user.profileName}
                  className={`${cfg.avatarSize} rounded-full object-cover ring-4 ${cfg.ringClass} shadow-lg`}
                />
                <h3 className="mt-2 text-xs font-bold text-gray-800 text-center">@{user.profileName}</h3>
                <p className={`text-xs font-bold ${cfg.textClass}`}>{user.completedSparks} sparks</p>

                {/* Pillar */}
                <div className={`mt-2 w-20 ${cfg.height} bg-gradient-to-t ${cfg.pillarGrad} rounded-t-xl flex flex-col items-center justify-center shadow-inner border-t border-x border-gray-200`}>
                  <svg className={`h-6 w-6 ${cfg.trophyColor}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75v1.5a5.002 5.002 0 014.153 3.655 2.25 2.25 0 01-.89 2.502l-1.397 1.048c-.524.393-.836 1.002-.836 1.652v1.143a1.5 1.5 0 01-1.5 1.5H9.72a1.5 1.5 0 01-1.5-1.5v-1.143c0-.65-.312-1.26-.836-1.652L6.002 10.41a2.25 2.25 0 01-.89-2.503 5.002 5.002 0 014.138-3.655V2.75A.75.75 0 0110 2z" clipRule="evenodd" />
                  </svg>
                  <span className={`text-xs font-extrabold mt-1 ${cfg.textClass}`}>{cfg.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rest of list */}
      {theRest.length > 0 && (
        <div className="rounded-2xl bg-white shadow-card ring-1 ring-gray-200/80 overflow-hidden">
          {theRest.map((user, index) => (
            <div
              key={user._id}
              className="flex items-center justify-between px-5 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <span className="w-8 text-center text-base font-bold text-gray-300 group-hover:text-orange-500 transition-colors tabular-nums">
                  {index + 4}
                </span>
                <img src={user.profileUrl} alt={user.profileName} className="h-10 w-10 rounded-full object-cover" />
                <div>
                  <h4 className="text-sm font-bold text-gray-900">@{user.profileName}</h4>
                </div>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-orange-50 px-3.5 py-1.5">
                <span className="text-sm font-bold text-orange-700">{user.completedSparks}</span>
                <span className="text-xs font-semibold text-orange-500">sparks</span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};