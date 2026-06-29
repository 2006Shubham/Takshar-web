import { useState, useEffect } from 'react';
import { DiscoverPeers } from './DiscoverPeers';
import { MyConnections } from './MyConnections';
import { PendingRequests } from './PendingRequests';

export const PeersNetwork = () => {
  const [activeTab, setActiveTab] = useState('discover');

  // Network State
  const [discover, setDiscover] = useState([]);
  const [connections, setConnections] = useState([]);
  const [pending, setPending] = useState({ received: [], sent: [] });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNetwork = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/network', { credentials: 'include' });
        const data = await res.json();

        setDiscover(data.discover || []);
        setConnections(data.connections || []);
        setPending(data.pending || { received: [], sent: [] });
      } catch (error) {
        console.error("Failed to load network", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNetwork();
  }, []);



  const handleResponse = async (connectionId, action) => {
    // 1. Find the specific request we are responding to
    const requestToProcess = pending.received.find(req => req.connectionId === connectionId);
    if (!requestToProcess) return;

    // 2. Optimistic UI Update
    // Remove it from the pending received list
    setPending(prev => ({
      ...prev,
      received: prev.received.filter(req => req.connectionId !== connectionId)
    }));

    // If accepted, immediately push it to the "My Connections" tab
    if (action === 'Accepted') {
      setConnections(prev => [requestToProcess, ...prev]);
    }

    // 3. Network Call
    try {
      const res = await fetch('http://localhost:5000/api/network/respond', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ connectionId, action })
      });

      if (!res.ok) throw new Error("Failed to update status");

    } catch (error) {
      console.error("Action failed, reverting UI...", error);
      // If it fails, revert the UI by putting them back in the pending list
      if (action === 'Accepted') {
        setConnections(prev => prev.filter(conn => conn.connectionId !== connectionId));
      }
      setPending(prev => ({
        ...prev,
        received: [requestToProcess, ...prev.received]
      }));
    }
  };

  // --- Optimistic Actions ---
  const handleConnect = async (peer) => {
    const peerId = peer._id;

    // 1. Optimistically change button in Discover to "Pending"
    setDiscover(prev => prev.map(p => p._id === peerId ? { ...p, localPending: true } : p));

    try {
      const res = await fetch('http://localhost:5000/api/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ to: peerId })
      });
      const newConn = await res.json();

      // 2. Add to Sent Requests tab immediately
      setPending(prev => ({
        ...prev,
        sent: [{ connectionId: newConn._id, peer: newConn.to }, ...prev.sent]
      }));
    } catch (error) {
      // Revert Discover UI on failure
      setDiscover(prev => prev.map(p => p._id === peerId ? { ...p, localPending: false } : p));
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 min-h-screen">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Peer Network</h1>
          <p className="text-sm text-gray-500 mt-1">Connect, challenge, and grow with other developers.</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex space-x-1 rounded-xl bg-gray-100 p-1">
          {[
            { id: 'discover', label: 'Discover' },
            { id: 'connections', label: 'My Connections' },
            { id: 'pending', label: 'Pending Requests' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              {tab.label}
              {tab.id === 'pending' && pending.received.length > 0 && (
                <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] text-white">
                  {pending.received.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><p className="text-gray-500">Loading network...</p></div>
      ) : (
        <div className="animate-in fade-in duration-300">
          {activeTab === 'discover' && <DiscoverPeers peers={discover} onConnect={handleConnect} />}
          {activeTab === 'connections' && <MyConnections connections={connections} />}
          {activeTab === 'pending' && <PendingRequests pending={pending} onResponse={handleResponse} />}
        </div>
      )}
    </div>
  );
};