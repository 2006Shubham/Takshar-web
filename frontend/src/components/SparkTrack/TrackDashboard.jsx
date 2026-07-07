import { useState, useEffect, useRef } from 'react';

export const TrackDashboard = ({ newTrack }) => {
  const [tracks, setTracks] = useState([]);
  const [selectedTrackId, setSelectedTrackId] = useState('');
  const [viewingDay, setViewingDay] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/tracks', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setTracks(data);
          if (data.length > 0) {
            setSelectedTrackId(data[0]._id);
            setViewingDay(data[0].currentDay);
          }
        }
      } catch (error) {
        console.error('Failed to load tracks', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTracks();
  }, [newTrack]);

  const handleTrackChange = (e) => {
    const newTrackId = e.target.value;
    setSelectedTrackId(newTrackId);
    const track = tracks.find((t) => t._id === newTrackId);
    if (track) setViewingDay(track.currentDay);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const uploadedUrl = 'https://res.cloudinary.com/demo/video/upload/v1/sample.mp4';
      await new Promise((r) => setTimeout(r, 1500));

      const res = await fetch(`http://localhost:5000/api/tracks/${selectedTrackId}/submit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ day: viewingDay, videoUrl: uploadedUrl }),
      });

      if (!res.ok) throw new Error('Failed to submit spark');
      const updatedData = await res.json();

      setTracks((prevTracks) =>
        prevTracks.map((t) => (t._id === selectedTrackId ? updatedData.track : t))
      );

      if (viewingDay < updatedData.track.totalDays) setViewingDay(viewingDay + 1);
    } catch (error) {
      alert(error.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-white shadow-card ring-1 ring-gray-200 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 bg-gray-100 rounded" />
          <div className="h-4 w-64 bg-gray-100 rounded" />
          <div className="h-40 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <div className="rounded-2xl bg-white shadow-card ring-1 ring-gray-200 p-8 text-center">
        <div className="h-12 w-12 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-3">
          <svg className="h-6 w-6 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h3 className="text-sm font-bold text-gray-900 mb-1">No Tracks Yet</h3>
        <p className="text-xs text-gray-400">Use Spark Compass to generate your first learning path.</p>
      </div>
    );
  }

  const activeTrack = tracks.find((t) => t._id === selectedTrackId);
  const dayData = activeTrack?.roadmap.find((r) => r.day === viewingDay);

  if (!activeTrack || !dayData) return null;

  return (
    <div className="rounded-2xl bg-white shadow-card ring-1 ring-gray-200/80 overflow-hidden">

      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Track Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Active Track</p>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm transition-all min-w-[200px]"
          >
            <span className="flex-1 font-bold text-gray-900 text-base truncate">
              {activeTrack.topic}
            </span>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180 text-orange-500' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isDropdownOpen && (
            <div className="absolute z-50 mt-2 w-full min-w-[260px] bg-white rounded-xl shadow-modal ring-1 ring-black/5 overflow-hidden">
              {tracks.map((track) => (
                <button
                  key={track._id}
                  onClick={() => { handleTrackChange({ target: { value: track._id } }); setIsDropdownOpen(false); }}
                  className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between gap-2 transition-colors ${
                    selectedTrackId === track._id
                      ? 'bg-orange-50 text-orange-700 font-bold'
                      : 'text-gray-700 font-medium hover:bg-gray-50'
                  }`}
                >
                  <span className="truncate">{track.topic}</span>
                  {selectedTrackId === track._id && (
                    <svg className="w-4 h-4 text-orange-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Streak Badge */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 px-3.5 py-2 rounded-xl text-sm font-bold text-gray-700 shadow-sm">
          <span className="text-lg">🔥</span>
          {activeTrack.currentStreak} Day Streak
        </div>
      </div>

      {/* Day Content */}
      <div className="p-6 sm:p-8">
        {/* Day Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <h3 className="text-xl font-bold text-gray-900 leading-snug">
            Day {dayData.day}: {dayData.title}
          </h3>
          {dayData.status === 'Completed' && (
            <span className="flex-shrink-0 inline-flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-1 rounded-full text-xs font-bold ring-1 ring-green-200">
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
              </svg>
              Done
            </span>
          )}
          {dayData.status === 'Active' && (
            <span className="flex-shrink-0 inline-flex items-center gap-1.5 bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full text-xs font-bold ring-1 ring-orange-200">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
              Active
            </span>
          )}
          {dayData.status === 'Locked' && (
            <span className="flex-shrink-0 inline-flex items-center bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full text-xs font-bold">
              🔒 Locked
            </span>
          )}
        </div>

        <p className="text-gray-600 leading-relaxed mb-7 text-sm">
          {dayData.description}
        </p>

        {/* Interactive Area */}
        {dayData.status === 'Locked' && (
          <div className="border-2 border-dashed border-gray-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center bg-gray-50">
            <svg className="w-8 h-8 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p className="text-sm font-bold text-gray-400">Day Locked</p>
            <p className="text-xs text-gray-400 mt-1">Complete Day {dayData.day - 1} to unlock this challenge.</p>
          </div>
        )}

        {dayData.status === 'Completed' && (
          <div className="rounded-2xl overflow-hidden ring-1 ring-gray-200 bg-black aspect-video">
            <video src={dayData.videoSubmissionUrl} controls className="w-full h-full object-contain" />
          </div>
        )}

        {dayData.status === 'Active' && (
          <div
            onClick={() => fileInputRef.current.click()}
            className="border-2 border-dashed border-orange-300 rounded-2xl p-10 flex flex-col items-center justify-center text-center bg-orange-50 cursor-pointer hover:bg-orange-100 hover:border-orange-400 transition-all group"
          >
            <input
              type="file"
              accept="video/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileUpload}
              disabled={isUploading}
            />

            {isUploading ? (
              <>
                <svg className="animate-spin h-8 w-8 text-orange-500 mb-3" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <p className="text-sm font-bold text-orange-900">Uploading Spark…</p>
              </>
            ) : (
              <>
                <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <svg className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-orange-900 mb-1">Upload Video Proof</p>
                <p className="text-xs text-orange-600/70">Click to browse or drag and drop</p>
              </>
            )}
          </div>
        )}

        {/* Day Navigation */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-100">
          <button
            onClick={() => setViewingDay((prev) => prev - 1)}
            disabled={viewingDay === 1}
            className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            Prev
          </button>

          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Day {viewingDay} of {activeTrack.totalDays}
          </span>

          <button
            onClick={() => setViewingDay((prev) => prev + 1)}
            disabled={viewingDay === activeTrack.totalDays}
            className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};