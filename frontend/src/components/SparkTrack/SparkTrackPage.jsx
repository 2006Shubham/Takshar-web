import React, { useState } from 'react';
import { SparkCompass } from './SparkCompass';
import { TrackDashboard } from './TrackDashboard';

export const SparkTrackPage = () => {
  const [trackAdded, setTrackAdded] = useState({});

  const addNewTrack = (newTrack) => {
    setTrackAdded(newTrack);
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100">
              <svg className="h-4 w-4 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Spark Track</h1>
          </div>
          <p className="text-sm text-gray-500 pl-10">AI-powered daily challenges tailored to your learning goals.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* LEFT: Compass Generator */}
          <div className="lg:col-span-1 sticky top-[76px]">
            <SparkCompass onTrackCreated={addNewTrack} />
          </div>

          {/* RIGHT: Active Track */}
          <div className="lg:col-span-2">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Your Learning Tracks</h2>
            <TrackDashboard newTrack={trackAdded} />
          </div>

        </div>
      </div>
    </div>
  );
};