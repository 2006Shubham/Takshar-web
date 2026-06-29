import { useState, useMemo, useEffect } from 'react';

export const PeersNetwork = () => {
  // Navigation & Search State
  const [activeTab, setActiveTab] = useState('discover'); // 'discover' | 'connections'
  const [searchQuery, setSearchQuery] = useState('');

  // Data & Interaction States
  const [users, setUsers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState(new Set());

  // UX States
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchPeers = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('http://localhost:5000/api/users', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch peers: ${response.statusText}`);
        }


        const data = await response.json();
        console.log(data.userlist);
        setUsers(data.userlist || data || []);

      } catch (err) {
        console.error("Network error:", err);
        setError("Could not load peers at this time. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPeers();
  }, []);

  // --- Defensive Date Formatting ---
  const formatJoinDate = (isoString) => {
    if (!isoString) return "Unknown date";

    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "Unknown date";

    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  // --- Optimistic Network Actions ---
  const handleConnect = async (userId) => {
    // 1. Optimistic UI: Set button to loading/pending
    setPendingRequests((prev) => {
      const newSet = new Set(prev);
      newSet.add(userId);
      return newSet;
    });

    try {
      // In a real scenario, you would trigger the API here:
      // await fetch('http://localhost:5000/api/connect', { ... })

      // Simulating network delay
      await new Promise(resolve => setTimeout(resolve, 800));

      setUsers((prevUsers) =>
        prevUsers.map(user =>
          user.id === userId || user._id === userId
            ? { ...user, isConnected: true }
            : user
        )
      );
    } catch (error) {
      console.error("Failed to connect", error);
    } finally {
      // Clear pending state
      setPendingRequests((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const handleRemoveConnection = async (userId) => {
    // Optimistic UI update
    setUsers((prevUsers) =>
      prevUsers.map(user =>
        user.id === userId || user._id === userId
          ? { ...user, isConnected: false }
          : user
      )
    );
    // Real scenario: await fetch('http://localhost:5000/api/disconnect', { ... })
  };

  // --- Derived State for Rendering ---
  const displayedUsers = useMemo(() => {
    if (!Array.isArray(users)) return [];

    return users.filter(user => {
      const matchesTab = activeTab === 'connections' ? user.isConnected : !user.isConnected;

      const username = user.username || '';
      const role = user.role || '';

      const matchesSearch = username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesTab && matchesSearch;
    });
  }, [users, activeTab, searchQuery]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 min-h-screen">

      {/* Header & Tab Navigation */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Peer Network</h1>
          <p className="text-sm text-gray-500 mt-1">Connect, challenge, and grow with other developers.</p>
        </div>

        {/* Action Bar: Search & Tabs */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-4">

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-xl border-0 bg-white py-2 pl-9 pr-4 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-orange-600 transition-shadow outline-none"
              placeholder="Search peers..."
            />
          </div>

          {/* Pill-shaped Tab Switcher */}
          <div className="flex space-x-1 rounded-xl bg-gray-100 p-1 shrink-0">
            {[
              { id: 'discover', label: 'Discover' },
              { id: 'connections', label: 'My Connections' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 ${activeTab === tab.id
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
          <svg className="animate-spin h-10 w-10 text-orange-500 mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-sm font-medium text-gray-500">Loading network...</p>
        </div>
      ) : error ? (
        <div className="rounded-2xl bg-red-50 p-6 border border-red-100 text-center max-w-2xl mx-auto animate-in fade-in duration-300">
          <svg className="mx-auto h-8 w-8 text-red-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm font-semibold text-red-800">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 inline-flex items-center text-sm font-medium text-red-600 hover:text-red-500 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      ) : displayedUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50/50 py-20 px-6 text-center animate-in fade-in duration-500">
          <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="text-sm font-bold text-gray-900">No peers found</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm">
            {searchQuery
              ? `We couldn't find anyone matching "${searchQuery}".`
              : activeTab === 'connections'
                ? "You haven't connected with anyone yet. Switch to Discover to find peers!"
                : "No new peers to discover right now."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
          {displayedUsers.map((user) => {
            const userId = user.id || user._id; // Accommodate different DB ID fields

            return (
              <div
                key={userId}
                className="group flex flex-col rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200 hover:-translate-y-1 hover:shadow-md transition-all duration-300"
              >
                {/* Card Header: Avatar & Info */}
                <div className="flex flex-col items-center text-center">
                  <img
                    src={user.profileUrl || 'https://i.pravatar.cc/150?u=fallback'}
                    alt={user.username}
                    className="h-20 w-20 rounded-full object-cover ring-4 ring-gray-50 shadow-sm"
                  />
                  <h3 className="mt-4 text-base font-bold text-gray-900 tracking-tight">@{user.username}</h3>
                  <span className="mt-1 inline-flex items-center rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-semibold text-orange-700 ring-1 ring-inset ring-orange-600/20">
                    {user.role || 'Member'}
                  </span>
                  <p className="mt-3 text-xs font-medium text-gray-500">
                    Joined {formatJoinDate(user.createdAt)}
                  </p>
                </div>

                {/* Card Footer: Actions */}
                <div className="mt-6 flex-1 flex flex-col justify-end">
                  {user.isConnected ? (
                    <div className="flex items-center gap-2">
                      <button className="flex-1 rounded-xl bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-100 transition-colors">
                        Message
                      </button>
                      <button
                        onClick={() => handleRemoveConnection(userId)}
                        className="rounded-xl p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors focus:outline-none"
                        title="Remove Connection"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleConnect(userId)}
                      disabled={pendingRequests.has(userId)}
                      className={`w-full rounded-xl px-3 py-2 text-sm font-semibold shadow-sm transition-all flex justify-center items-center gap-2 ${pendingRequests.has(userId)
                        ? 'bg-orange-100 text-orange-700 cursor-not-allowed'
                        : 'bg-orange-600 text-white hover:bg-orange-500'
                        }`}
                    >
                      {pendingRequests.has(userId) ? (
                        <>
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          Connecting...
                        </>
                      ) : (
                        'Connect'
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};