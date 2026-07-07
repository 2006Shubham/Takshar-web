import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '../context/UserContext';

export const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { userProfileData, setUserProfileData } = useUser();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const onLogout = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Logout request failed');
      if (setUserProfileData) setUserProfileData(null);
      window.location.href = '/login';
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  if (!userProfileData) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all p-0.5"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <img
          className="h-8 w-8 rounded-full object-cover ring-2 ring-gray-200 hover:ring-orange-300 transition-all"
          src={userProfileData.avatarUrl}
          alt={userProfileData.profileName}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 origin-top-right rounded-2xl bg-white shadow-modal ring-1 ring-black/5 focus:outline-none z-50 overflow-hidden">

          {/* User Header */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <img
                className="h-12 w-12 rounded-full object-cover ring-2 ring-gray-100 flex-shrink-0"
                src={userProfileData.avatarUrl}
                alt=""
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-gray-900 truncate">{userProfileData.profileName}</h3>
                <p className="text-xs text-gray-500 truncate mt-0.5">{userProfileData.organization}</p>
                <span className="mt-1 inline-flex items-center rounded-full bg-orange-50 px-2 py-0.5 text-xs font-semibold text-orange-700">
                  {userProfileData.role}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-1.5">
            <button
              className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              onClick={onLogout}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};