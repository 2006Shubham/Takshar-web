import React, { useState, useEffect } from 'react';
import { SparkCompass } from './SparkCompass';
import { TrackDashboard } from './TrackDashboard';

export const SparkTrackPage = () => {

    const[trackAdded,setTrackAdded]=useState({});

    const addNewTrack =  (newTrack)=>{

            setTrackAdded(newTrack);

    }

    return (
        <div className="max-w-6xl mx-auto p-4">
            {/* 
              Layout: 
              Mobile: Stacks compass on top of dashboard 
              Desktop (lg): Compass takes 1/3 space, Dashboard takes 2/3 space 
            */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                {/* LEFT SIDEBAR: The Generator */}
                <div className="lg:col-span-1 sticky top-20">
                    <SparkCompass onTrackCreated={addNewTrack} />
                </div>

                {/* RIGHT SIDEBAR: The Running Tracks Feed */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Your Running Tracks</h2>
                    <TrackDashboard newTrack = {trackAdded}/>
                </div>

            </div>
        </div>
    );
};