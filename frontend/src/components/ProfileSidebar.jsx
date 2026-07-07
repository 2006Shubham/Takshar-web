import { useState } from "react";
import { useUser } from '../context/UserContext';
import { EditProfile } from "./EditProfile";

export const ProfileSidebar = () => {
  const { userProfileData, isLoading } = useUser();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  if (isLoading || !userProfileData) {
    return (
      <div className="rounded-2xl bg-white shadow-card ring-1 ring-gray-200 overflow-hidden animate-pulse">
        <div className="h-20 bg-gray-100" />
        <div className="px-5 pb-5 pt-3 space-y-3">
          <div className="h-14 w-14 -mt-8 rounded-full bg-gray-200 ring-2 ring-white" />
          <div className="h-4 w-32 bg-gray-100 rounded" />
          <div className="h-3 w-24 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Sparks Sent', value: userProfileData.stats?.sparksSent ?? 0 },
    { label: 'Sparks Received', value: userProfileData.stats?.sparksReceived ?? 0 },
    { label: 'Streak', value: `${userProfileData.stats?.streak ?? 0}d 🔥` },
    { label: 'Peers', value: userProfileData.stats?.peers ?? 0 },
  ];

  return (
    <>
      <div className="sticky top-[76px] rounded-2xl bg-white shadow-card ring-1 ring-gray-200/80 overflow-hidden">

        {/* Banner */}
        <div
          className="h-20 w-full bg-cover bg-center"
          style={{
            backgroundImage: userProfileData.bannerUrl
              ? `url(${userProfileData.bannerUrl})`
              : 'linear-gradient(135deg, #ea580c 0%, #fb923c 50%, #fbbf24 100%)',
          }}
        />

        {/* Avatar + Info */}
        <div className="px-5 pb-4">
          <div className="-mt-8 mb-3 inline-block rounded-full bg-white p-1 ring-1 ring-gray-200 shadow-sm">
            <img
              src={userProfileData.avatarUrl || `https://i.pravatar.cc/150?u=${userProfileData.username}`}
              alt={userProfileData.profileName}
              className="h-14 w-14 rounded-full object-cover"
            />
          </div>

          <div>
            <h3 className="text-base font-bold text-gray-900 leading-tight">
              {userProfileData.profileName}
            </h3>
            {userProfileData.organization && (
              <p className="text-xs font-semibold text-gray-500 mt-0.5">{userProfileData.organization}</p>
            )}
            {userProfileData.role && (
              <span className="mt-2 inline-flex items-center rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-semibold text-orange-700">
                {userProfileData.role}
              </span>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="border-t border-gray-100 grid grid-cols-2 divide-x divide-y divide-gray-100">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center py-3 px-2 hover:bg-gray-50 transition-colors">
              <span className="text-lg font-bold text-gray-900">{stat.value}</span>
              <span className="text-xs text-gray-500 font-medium mt-0.5 text-center">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Edit Profile */}
        <div className="px-5 py-3 border-t border-gray-100">
          <button
            onClick={() => setIsEditProfileOpen(true)}
            className="btn-ghost w-full text-center text-sm"
          >
            Edit Profile
          </button>
        </div>
      </div>

      <EditProfile
        onClose={() => setIsEditProfileOpen(false)}
        isOpen={isEditProfileOpen}
      />
    </>
  );
};