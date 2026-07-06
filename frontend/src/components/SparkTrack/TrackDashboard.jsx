import { useState, useEffect, useRef } from 'react';

export const TrackDashboard = ({ newTrack }) => {
    const [tracks, setTracks] = useState([]);
    const [selectedTrackId, setSelectedTrackId] = useState('');
    const [viewingDay, setViewingDay] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    

    // Custom Dropdown State
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const fileInputRef = useRef(null);

    // Close dropdown when clicking outside of it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // 1. Fetch Tracks on Mount
    useEffect(() => {
        const fetchTracks = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/tracks', {
                    credentials: 'include'
                });
                if (res.ok) {
                    const data = await res.json();
                    setTracks(data);
                    if (data.length > 0) {
                        setSelectedTrackId(data[0]._id);
                        setViewingDay(data[0].currentDay); // Auto-jump to their active day
                    }
                }
            } catch (error) {
                console.error("Failed to load tracks", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTracks();
    }, [newTrack]);

    // 2. Handle Track Switch
    const handleTrackChange = (e) => {
        const newTrackId = e.target.value;
        setSelectedTrackId(newTrackId);

        // Find the new track and auto-set the viewing day to its current active day
        const track = tracks.find(t => t._id === newTrackId);
        if (track) {
            setViewingDay(track.currentDay);
        }
    };

    // 3. Handle File Upload & Submission
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            // STEP A: Upload to Cloudinary (Replace with your actual UploadContext logic)
            // const uploadedUrl = await uploadVideoToCloudinary(file);

            // --- MOCK UPLOAD DELAY FOR TESTING ---
            const uploadedUrl = "https://res.cloudinary.com/demo/video/upload/v1/sample.mp4";
            await new Promise(r => setTimeout(r, 1500));

            // STEP B: Save to Takshar Backend
            const res = await fetch(`http://localhost:5000/api/tracks/${selectedTrackId}/submit`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    day: viewingDay,
                    videoUrl: uploadedUrl
                })
            });

            if (!res.ok) throw new Error("Failed to submit spark");
            const updatedData = await res.json();

            // Update local state so UI refreshes immediately
            setTracks(prevTracks =>
                prevTracks.map(t => t._id === selectedTrackId ? updatedData.track : t)
            );

            // If they completed the active day, jump them to the newly unlocked next day
            if (viewingDay < updatedData.track.totalDays) {
                setViewingDay(viewingDay + 1);
            }

        } catch (error) {
            alert(error.message);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>;
    if (tracks.length === 0) return <div className="p-8 text-center text-gray-500">No active tracks. Create one in the Spark Compass!</div>;

    const activeTrack = tracks.find(t => t._id === selectedTrackId);
    const dayData = activeTrack.roadmap.find(r => r.day === viewingDay);

    return (
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 overflow-hidden">

            {/* Header & Custom Dropdown integrated together */}
            <div className="bg-gray-50 p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                {/* Custom Select Component */}
                <div className="relative" ref={dropdownRef}>
                    <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Your Tracks</h2>

                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center justify-between w-full sm:w-auto min-w-[240px] bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-left focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm hover:bg-gray-50 transition-all duration-200"
                        aria-haspopup="listbox"
                        aria-expanded={isDropdownOpen}
                    >
                        <span className="block truncate font-bold text-gray-900 text-lg">
                            {activeTrack ? activeTrack.topic : "Select a Track"}
                        </span>
                        <svg
                            className={`w-5 h-5 text-gray-400 ml-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-orange-500' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute z-50 mt-2 w-full min-w-[280px] bg-white rounded-xl shadow-xl ring-1 ring-black/5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="py-1 max-h-60 overflow-y-auto">
                                {tracks.map(track => (
                                    <button
                                        key={track._id}
                                        onClick={() => {
                                            handleTrackChange({ target: { value: track._id } });
                                            setIsDropdownOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between group
                                            ${selectedTrackId === track._id
                                                ? 'bg-orange-50 text-orange-700 font-bold'
                                                : 'text-gray-700 font-medium hover:bg-gray-50'
                                            }`}
                                    >
                                        <span className="truncate pr-4 group-hover:text-orange-600 transition-colors">
                                            {track.topic}
                                        </span>
                                        {selectedTrackId === track._id && (
                                            <svg className="w-5 h-5 text-orange-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Streak Badge */}
                <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl ring-1 ring-gray-200 shadow-sm text-sm font-bold text-gray-700 h-fit">
                    <span className="text-orange-500 text-lg">🔥</span>
                    {activeTrack.currentStreak} Day Streak
                </div>
            </div>

            {/* Main Spark Content */}
            <div className="p-6 sm:p-8">
                {/* Navigation & Status Header */}
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">
                        Day {dayData.day}: {dayData.title}
                    </h3>

                    {/* Status Badge */}
                    {dayData.status === 'Completed' && <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Completed</span>}
                    {dayData.status === 'Active' && <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold animate-pulse">Active</span>}
                    {dayData.status === 'Locked' && <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-bold">Locked</span>}
                </div>

                <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                    {dayData.description}
                </p>

                {/* Interactive Area Based on Status */}
                <div className="mb-8">
                    {dayData.status === 'Locked' && (
                        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center bg-gray-50">
                            <svg className="w-10 h-10 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <h4 className="text-gray-900 font-bold mb-1">Day is Locked</h4>
                            <p className="text-sm text-gray-500">Complete Day {dayData.day - 1} to unlock this challenge.</p>
                        </div>
                    )}

                    {dayData.status === 'Completed' && (
                        <div className="rounded-2xl overflow-hidden ring-1 ring-gray-200 bg-black aspect-video relative flex items-center justify-center group">
                            <video src={dayData.videoSubmissionUrl} controls className="w-full h-full object-contain" />
                        </div>
                    )}

                    {dayData.status === 'Active' && (
                        <div
                            onClick={() => fileInputRef.current.click()}
                            className="border-2 border-dashed border-orange-300 rounded-2xl p-10 flex flex-col items-center justify-center text-center bg-orange-50 cursor-pointer hover:bg-orange-100 transition-colors group"
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
                                <div className="flex flex-col items-center">
                                    <svg className="animate-spin h-10 w-10 text-orange-500 mb-3" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <h4 className="text-orange-900 font-bold">Uploading Spark...</h4>
                                </div>
                            ) : (
                                <>
                                    <div className="bg-white p-3 rounded-full shadow-sm text-orange-500 mb-3 group-hover:scale-110 transition-transform">
                                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                    </div>
                                    <h4 className="text-orange-900 font-bold mb-1">Upload Video Proof</h4>
                                    <p className="text-sm text-orange-600/80">Click to browse or drag and drop</p>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Navigation */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                    <button
                        onClick={() => setViewingDay(prev => prev - 1)}
                        disabled={viewingDay === 1}
                        className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        Previous Day
                    </button>

                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        {viewingDay} of {activeTrack.totalDays}
                    </span>

                    <button
                        onClick={() => setViewingDay(prev => prev + 1)}
                        disabled={viewingDay === activeTrack.totalDays}
                        className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        Next Day
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>

            </div>
        </div>
    );
};