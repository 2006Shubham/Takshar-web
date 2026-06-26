import { useEffect } from "react";
import { useState } from "react";

export const ProfileSidebar = () => {


    const [userProfileData, setUserProfileData] = useState(null);

    useEffect(() => {


        const fetchUserProfileData = async () => {


            const response = await fetch("http://localhost:5000/api/userprofile", {

                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
                ,
                credentials: 'include'

            });

            const data = await response.json();

            console.log(data);

            const userProfileData = {
                name: data.username,
                headline: "Computer Science & Engineering @ COEP Pune | Full-Stack Web Developer",
                avatarUrl: "https://i.pravatar.cc/150?u=shubham",
                bannerUrl: "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=400&q=80",
                stats: {
                    sparksSent: data.sentCount,
                    sparksReceived: data.receivedCount,
                    streak: 5,
                    peers: 112
                }
            }

            setUserProfileData(userProfileData);




        }
        fetchUserProfileData();

    }, [])


    // // Dummy data tailored to the Takshar platform
    // const userProfile = {
    //     name: "Shubham Deshmukh",
    //     headline: "Computer Science & Engineering @ COEP Pune | Full-Stack Web Developer",
    //     avatarUrl: "https://i.pravatar.cc/150?u=shubham",
    //     bannerUrl: "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=400&q=80",
    //     stats: {
    //         sparksSent: 24,
    //         sparksReceived: 18,
    //         streak: 5,
    //         friends: 112
    //     }
    // };

    if (!userProfileData) {
        return <div className="p-4">Loading your profile...</div>;
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
                            <svg className="h-4 w-4 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                            </svg>
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