import { useState, useEffect } from 'react';
import { DiscoverPeers } from './DiscoverPeers';
import { MyConnections } from './MyConnections';
import { PendingRequests } from './PendingRequests';

const tabs = [
  { id: 'discover', label: 'Discover' },
  { id: 'connections', label: 'My Peers' },
  { id: 'pending', label: 'Requests' },
];

export const PeersNetwork = () => {
  const [activeTab, setActiveTab] = useState('discover');
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
        console.error('Failed to load network', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNetwork();
  }, []);

  const handleResponse = async (connectionId, action) => {
    const requestToProcess = pending.received.find((req) => req.connectionId === connectionId);
    if (!requestToProcess) return;

    setPending((prev) => ({ ...prev, received: prev.received.filter((req) => req.connectionId !== connectionId) }));

    if (action === 'Accepted') {
      setConnections((prev) => [requestToProcess, ...prev]);
    } else if (action === 'Declined') {
      setDiscover((prev) => [requestToProcess.peer, ...prev]);
    }

    try {
      const res = await fetch('http://localhost:5000/api/network/respond', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ connectionId, action }),
      });
      if (!res.ok) throw new Error('Failed to update status');
    } catch (error) {
      console.error('Action failed, reverting UI…', error);
      if (action === 'Accepted') setConnections((prev) => prev.filter((conn) => conn.connectionId !== connectionId));
      else if (action === 'Declined') setDiscover((prev) => prev.filter((peer) => peer._id !== requestToProcess.peer._id));
      setPending((prev) => ({ ...prev, received: [requestToProcess, ...prev.received] }));
    }
  };

  const handleConnect = async (peer) => {
    const peerId = peer._id;
    setDiscover((prev) => prev.map((p) => (p._id === peerId ? { ...p, localPending: true } : p)));
    try {
      const res = await fetch('http://localhost:5000/api/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ to: peerId }),
      });
      const newConn = await res.json();
      setPending((prev) => ({ ...prev, sent: [{ connectionId: newConn._id, peer: newConn.to }, ...prev.sent] }));
    } catch (error) {
      setDiscover((prev) => prev.map((p) => (p._id === peerId ? { ...p, localPending: false } : p)));
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 min-h-screen">

      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
              <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Peer Network</h1>
          </div>
          <p className="text-sm text-gray-500 pl-10">Connect, challenge, and grow with other learners.</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150 focus:outline-none ${
                activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {tab.id === 'pending' && pending.received.length > 0 && (
                <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {pending.received.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-52 rounded-2xl bg-white animate-pulse ring-1 ring-gray-200" />
          ))}
        </div>
      ) : (
        <div>
          {activeTab === 'discover' && <DiscoverPeers peers={discover} onConnect={handleConnect} />}
          {activeTab === 'connections' && <MyConnections connections={connections} />}
          {activeTab === 'pending' && <PendingRequests pending={pending} onResponse={handleResponse} />}
        </div>
      )}
    </div>
  );
};