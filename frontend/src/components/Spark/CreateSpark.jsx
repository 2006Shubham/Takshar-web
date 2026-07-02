import { useEffect, useState } from 'react';

export const CreateSpark = () => {
    const [sparkTopic, setSparkTopic] = useState('');
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [selectedUserId, setSelectedUserId] = useState(null);

    const [availableUsers, setAvailableUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(true);

    useEffect(() => {
        const fetchPeers = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/users', {
                    method: 'GET',
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch peers');
                }

                const data = await response.json();

                // Match the optimized backend which sends the raw array directly
                setAvailableUsers(Array.isArray(data.userlist) ? data.userlist : []);
                setUsersLoading(false);
            } catch (error) {
                console.error("Error loading peers directory", error);
                setUsersLoading(false);
            }
        };
        fetchPeers();
    }, []);

    // Bulletproof filtering tracking database username and role paths
    const filteredUsers = (Array.isArray(availableUsers) ? availableUsers : []).filter(user => {
        const term = userSearchTerm ? userSearchTerm.toLowerCase() : '';
        const matchName = user.profileName?.toLowerCase().includes(term) || false;
        const matchRole = user.role?.toLowerCase().includes(term) || false;
        return matchName || matchRole;
    });

    const handleSendSpark = async () => {
        console.log("TODO: Create POST request to /api/sparks with topic:", sparkTopic, "to user:", selectedUserId);

        try {

            const response = await fetch('http://localhost:5000/api/sendspark', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
                ,
                body: JSON.stringify(
                    {
                        to: selectedUserId,
                        topic: sparkTopic,
                        createdAt: Date.now(),
                        status: "pending"


                    }),


            });

            if (response.ok) {
                console.log("Spark Sent Success");
            }

        } catch (error) {

            console.log("Error in the spark sent", error);
        }



    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Topic Input Field */}
            <div>
                <label htmlFor="topic" className="block text-sm font-semibold leading-6 text-gray-900">
                    What is the <span className="text-orange-500">spark </span>topic?
                </label>
                <div className="mt-2">
                    <input
                        type="text"
                        id="topic"
                        value={sparkTopic}
                        onChange={(e) => setSparkTopic(e.target.value)}
                        className="block w-full rounded-xl border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-orange-600 sm:text-sm sm:leading-6 transition-shadow outline-none"
                        placeholder="e.g., Explain React Server Components in 60 seconds..."
                    />
                </div>
            </div>

            {/* Peer Directory Frame */}
            <div>
                <div className="flex items-center justify-between">
                    <label htmlFor="user-search" className="block text-sm font-semibold leading-6 text-gray-900">
                        Select a Peer
                    </label>
                    <span className="text-xs text-gray-500">
                        {usersLoading ? "Loading..." : `${filteredUsers.length} available`}
                    </span>
                </div>

                {/* Search Bar input */}
                <div className="relative mt-2 mb-4">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        id="user-search"
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                        disabled={usersLoading}
                        className="block w-full rounded-lg border-0 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-orange-600 transition-shadow outline-none disabled:opacity-60"
                        placeholder="Search by name or role..."
                    />
                </div>

                {/* Dynamic Directory Handling UI */}
                {usersLoading ? (
                    <div className="text-center py-12 text-sm text-gray-500">
                        Fetching active peers from database...
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-12 text-sm text-gray-500">
                        No peers match your search query.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-64 overflow-y-auto p-1">
                        {filteredUsers.map((user) => (
                            <button
                                key={user._id} // Fixed key mismatch -> pointed directly to _id
                                onClick={() => setSelectedUserId(user._id)}
                                className={`flex items-center gap-4 rounded-xl p-3 text-left transition-all border ${selectedUserId === user._id
                                    ? 'border-orange-600 bg-orange-50 ring-1 ring-orange-600'
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                {/* Hydrated with user.profileUrl and structural placeholder fallback */}
                                <img
                                    src={user.profileUrl || `https://i.pravatar.cc/150?u=${user._id}`}
                                    alt=""
                                    className="h-12 w-12 rounded-full bg-gray-100 object-cover"
                                />
                                <div>
                                    <p className={`text-sm font-medium ${selectedUserId === user._id ? 'text-orange-900' : 'text-gray-900'}`}>
                                        {user.profileName}
                                    </p>
                                    {/* Hydrated with Mongoose user.role option fallback */}
                                    <p className={`text-xs ${selectedUserId === user._id ? 'text-orange-700' : 'text-gray-500'}`}>
                                        {user.role || 'Spark Challenger'}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Action Submit Control Footer */}
            <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                    onClick={handleSendSpark}
                    disabled={!sparkTopic || !selectedUserId || usersLoading}
                    className="inline-flex items-center justify-center rounded-full bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    Send Spark
                    <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </button>
            </div>
        </div>
    );
};