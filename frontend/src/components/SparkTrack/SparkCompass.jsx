import React, { useState } from 'react';

export const SparkCompass = ({ onTrackCreated }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    topic: '',
    difficulty: 'Beginner',
    days: '7',
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
          totalDays: formData.days,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate track.');

      if (onTrackCreated) onTrackCreated(data.track);
      setFormData({ topic: '', difficulty: 'Beginner', days: '7' });
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-white shadow-card ring-1 ring-gray-200/80 overflow-hidden">
        {/* Orange accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-orange-500 to-amber-400" />
        <div className="p-5 flex flex-col items-center justify-center text-center min-h-[180px]">
          <svg className="animate-spin h-7 w-7 text-orange-500 mb-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-sm font-bold text-gray-900">Designing your roadmap…</p>
          <p className="text-xs text-gray-400 mt-1">AI is crafting daily challenges</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white shadow-card ring-1 ring-gray-200/80 overflow-hidden">
      {/* Orange accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-orange-500 to-amber-400" />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-100">
            <svg className="h-4 w-4 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-gray-900">Spark Compass</h3>
        </div>
        <p className="text-xs text-gray-400 mb-4 pl-9">Set a goal, get a daily challenge roadmap.</p>

        <form onSubmit={handleGenerateTrack} className="space-y-3">
          {/* Topic */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">What do you want to learn?</label>
            <input
              type="text"
              required
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              placeholder="e.g. System Design, Figma UI…"
              className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-2 px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent focus:bg-white outline-none transition-all"
            />
          </div>

          {/* Difficulty + Duration */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Difficulty</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 px-2.5 text-xs text-gray-700 focus:ring-2 focus:ring-orange-500 focus:border-transparent focus:bg-white outline-none transition-all"
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
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 px-2.5 text-xs text-gray-700 focus:ring-2 focus:ring-orange-500 focus:border-transparent focus:bg-white outline-none transition-all"
              >
                <option value="3">3 Days</option>
                <option value="7">7 Days</option>
                <option value="14">14 Days</option>
              </select>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-2.5 text-xs font-medium text-red-600">
              {error}
            </div>
          )}

          {/* CTA */}
          <button
            type="submit"
            className="w-full rounded-xl bg-orange-50 hover:bg-orange-600 hover:text-white border border-orange-200 hover:border-orange-600 px-4 py-2.5 text-xs font-bold text-orange-600 transition-all duration-150"
          >
            Generate Learning Path →
          </button>
        </form>
      </div>
    </div>
  );
};