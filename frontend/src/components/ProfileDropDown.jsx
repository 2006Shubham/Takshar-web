import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '../context/UserContext';

export const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Tap into the global context
  const { userProfileData, setUserProfileData } = useUser();

  // --- Click Outside to Close Logic ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      // If the dropdown is open AND the click is outside the dropdown element, close it
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const onLogout = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Logout request failed');
      }

      const data = await response.json();

      if (setUserProfileData) {
        setUserProfileData(null);
      }

      // Redirect on success
      window.location.href = '/login';
      return data;

    } catch (error) {
      console.error('Error during logout:', error);
    }

  }

  // Safe fallback if data hasn't loaded yet (prevents crashes or blank avatars)
  if (!userProfileData) return null;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>

      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded-full p-0.5 transition-all"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <img
          className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover shadow-sm ring-1 ring-gray-200"
          src={userProfileData.avatarUrl}
          alt={`${userProfileData.name}'s profile`}
        />
      </button>

      {/* The Popup Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 origin-top-right rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 focus:outline-none z-50 animate-in fade-in slide-in-from-top-2 duration-200">

          {/* User Info Header */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-start gap-3">
              <img
                className="h-14 w-14 rounded-full object-cover shadow-sm ring-1 ring-gray-200"
                src={userProfileData.avatarUrl}
                alt=""
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-gray-900 truncate">
                  {userProfileData.name}
                </h3>
                <h3 className="text-base font-bold text-gray-900 truncate">
                  {userProfileData.organization}
                </h3>
                <p className="text-xs text-gray-600 mt-1 line-clamp-3 leading-snug">
                  {userProfileData.role}
                </p>
              </div>
            </div>

            {/* Sign Out Section */}
            <div className="py-1 mt-4">
              <button
                className="w-full text-left px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-red-600 transition-colors rounded-b-2xl font-medium"
                onClick={() => {
                  console.log("Signing out...");
                  onLogout();

                }}
              >
                Sign out
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};