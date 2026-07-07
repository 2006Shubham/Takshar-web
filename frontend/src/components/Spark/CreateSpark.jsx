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
          credentials: 'include',
        });
        if (!response.ok) throw new Error('Failed to fetch peers');
        const data = await response.json();
        setAvailableUsers(Array.isArray(data.userlist) ? data.userlist : []);
      } catch (error) {
        console.error('Error loading peers directory', error);
      } finally {
        setUsersLoading(false);
      }
    };
    fetchPeers();
  }, []);

  const filteredUsers = (Array.isArray(availableUsers) ? availableUsers : []).filter((user) => {
    const term = userSearchTerm ? userSearchTerm.toLowerCase() : '';
    return (
      user.profileName?.toLowerCase().includes(term) ||
      user.role?.toLowerCase().includes(term)
    );
  });

  const handleSendSpark = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/sendspark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          to: selectedUserId,
          topic: sparkTopic,
          createdAt: Date.now(),
          status: 'pending',
        }),
      });
      if (response.ok) {
        console.log('Spark Sent Success');
        setSparkTopic('');
        setSelectedUserId(null);
      }
    } catch (error) {
      console.log('Error sending spark', error);
    }
  };

  return (
    <div className="space-y-7">

      {/* Topic Input */}
      <div>
        <label htmlFor="topic" className="block text-sm font-bold text-gray-800 mb-2">
          What's the challenge topic?
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <svg className="h-4 w-4 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <input
            type="text"
            id="topic"
            value={sparkTopic}
            onChange={(e) => setSparkTopic(e.target.value)}
            className="block w-full rounded-xl border-0 py-3 pl-10 pr-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-orange-500 sm:text-sm outline-none transition-all"
            placeholder="e.g. Explain React hooks in 60 seconds…"
          />
        </div>
      </div>

      {/* Peer Selection */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-bold text-gray-800">
            Pick a peer
          </label>
          <span className="text-xs font-medium text-gray-400">
            {usersLoading ? 'Loading…' : `${filteredUsers.length} available`}
          </span>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={userSearchTerm}
            onChange={(e) => setUserSearchTerm(e.target.value)}
            disabled={usersLoading}
            className="block w-full rounded-xl border-0 bg-gray-50 py-2.5 pl-9 pr-4 text-sm text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all disabled:opacity-60"
            placeholder="Search by name or role…"
          />
        </div>

        {/* Peer Grid */}
        {usersLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <p className="text-center py-8 text-sm text-gray-400">No peers match your search.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-0.5">
            {filteredUsers.map((user) => (
              <button
                key={user._id}
                onClick={() => setSelectedUserId(user._id)}
                className={`flex items-center gap-3 rounded-xl p-3 text-left transition-all border ${
                  selectedUserId === user._id
                    ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <img
                  src={user.profileUrl || `https://i.pravatar.cc/150?u=${user._id}`}
                  alt=""
                  className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                />
                <div className="min-w-0">
                  <p className={`text-sm font-semibold truncate ${selectedUserId === user._id ? 'text-orange-900' : 'text-gray-900'}`}>
                    {user.profileName}
                  </p>
                  <p className={`text-xs truncate mt-0.5 ${selectedUserId === user._id ? 'text-orange-600' : 'text-gray-400'}`}>
                    {user.role || 'Spark Challenger'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* CTA Footer */}
      <div className="pt-5 border-t border-gray-100 flex justify-end">
        <button
          onClick={handleSendSpark}
          disabled={!sparkTopic || !selectedUserId || usersLoading}
          className="btn-primary px-6 py-2.5 disabled:opacity-40"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Send Spark
        </button>
      </div>
    </div>
  );
};