import React, { createContext, useState, useContext, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [userProfileData, setUserProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfileData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/userprofile", {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          setUserProfileData({
            name: data.username,
            headline: data.role,
            avatarUrl: data.profileUrl,
            bannerUrl: "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=400&q=80",
            stats: {
              sparksSent: data.sentCount,
              sparksReceived: data.receivedCount,
              streak: data.displayStreak,
              peers: data.peersCount
            },
          });
        }
      } catch (error) {
        console.error("Failed to fetch user profile", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfileData();
  }, []);

  return (
    <UserContext.Provider value={{ userProfileData, isLoading, setUserProfileData }}>
      {children}
    </UserContext.Provider>
  );
};