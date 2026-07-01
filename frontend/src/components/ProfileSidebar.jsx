import React from "react";
import { useUser } from '../context/UserContext';

export const ProfileSidebar = () => {
    // Tap into the global context
    const { userProfileData, isLoading } = useUser();

    if (isLoading || !userProfileData) {
        return <div className="p-4 text-sm text-gray-500 font-medium">Loading your profile...</div>;
    }

    return (
        <div className="sticky top-20 flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">

            {/* Banner Image */}
            <div
                className="h-20 w-full bg-cover bg-center sm:h-20"
                style={{ backgroundImage: `url(${userProfileData.bannerUrl})` }}
            />

            {/* Avatar & Info */}
            <div className="relative px-4 pb-4 flex flex-col items-start sm:items-center justify-start sm:px-6">
                <div className="-mt-10 mb-2 rounded-full bg-white p-1 ring-1 ring-gray-200">
                    <img
                        src={userProfileData.avatarUrl}
                        alt={userProfileData.name}
                        className="h-16 w-16 rounded-full object-cover sm:h-20 sm:w-20"
                    />
                </div>

                <h2 className="text-lg font-bold text-gray-900 leading-tight">
                    {userProfileData.name}
                </h2>
                <p className="mt-1 md:text-center text-xs font-medium text-gray-500">
                    {userProfileData.headline}
                </p>
            </div>

            {/* Stats Section */}
            <div className="border-t border-gray-100 px-4 py-3 sm:px-6">
                <ul className="space-y-3 text-sm">
                    <li className="flex items-center justify-between group cursor-pointer">
                        <span className="font-medium text-gray-500 group-hover:text-gray-900 transition-colors">Sparks Sent</span>
                        <span className="font-bold text-orange-600">{userProfileData.stats.sparksSent}</span>
                    </li>
                    <li className="flex items-center justify-between group cursor-pointer">
                        <span className="font-medium text-gray-500 group-hover:text-gray-900 transition-colors">Sparks Received</span>
                        <span className="font-bold text-orange-600">{userProfileData.stats.sparksReceived}</span>
                    </li>
                    <li className="flex items-center justify-between group cursor-pointer">
                        <span className="font-medium text-gray-500 group-hover:text-gray-900 transition-colors">Current Streak</span>
                        <div className="flex items-center gap-1 font-bold text-orange-600">
                            {userProfileData.stats.streak} Days
                        </div>
                    </li>
                    <li className="flex items-center justify-between group cursor-pointer pt-2 border-t border-gray-50">
                        <span className="font-medium text-gray-900 group-hover:text-orange-600 transition-colors">Peers</span>
                        <span className="font-bold text-gray-900">{userProfileData.stats.peers}</span>
                    </li>
                </ul>
            </div>
        </div>
    );
};