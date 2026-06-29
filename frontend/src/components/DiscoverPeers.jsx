
import { formatJoinDate } from '../utils/dateUtils'; 

export const DiscoverPeers = ({ peers, onConnect }) => {
  if (peers.length === 0) return <p className="text-center py-10 text-gray-500">No new peers to discover right now.</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {peers.map((peer) => (
        <div key={peer._id} className="flex flex-col rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <div className="flex flex-col items-center text-center">
            <img src={peer.profileUrl} alt={peer.username} className="h-20 w-20 rounded-full object-cover ring-4 ring-gray-50" />
            <h3 className="mt-4 text-base font-bold text-gray-900">@{peer.username}</h3>
            <span className="mt-1 inline-flex items-center rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-semibold text-orange-700">{peer.role}</span>
            <p className="mt-3 text-xs text-gray-500">Joined {formatJoinDate(peer.createdAt)}</p>
          </div>

          <div className="mt-6 flex flex-col justify-end">
            <button
              onClick={() => onConnect(peer)}
              disabled={peer.localPending}
              className={`w-full rounded-xl px-3 py-2 text-sm font-semibold shadow-sm transition-all ${
                peer.localPending ? 'bg-orange-50 text-orange-700 cursor-not-allowed' : 'bg-orange-600 text-white hover:bg-orange-500'
              }`}
            >
              {peer.localPending ? 'Request Sent' : 'Connect'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};