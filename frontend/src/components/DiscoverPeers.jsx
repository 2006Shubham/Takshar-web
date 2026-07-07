import { formatJoinDate } from '../utils/dateUtils';

export const DiscoverPeers = ({ peers, onConnect }) => {
  if (peers.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <div className="h-12 w-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
          <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-gray-500">No new peers to discover</p>
        <p className="text-xs text-gray-400 mt-1">You're already connected with everyone!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {peers.map((peer) => (
        <div key={peer._id} className="flex flex-col rounded-2xl bg-white p-5 shadow-card ring-1 ring-gray-200/80 hover:shadow-card-hover transition-shadow duration-200">

          {/* Avatar with gradient bg */}
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-orange-100 to-amber-50 p-0.5 shadow-sm">
                <img
                  src={peer.profileUrl}
                  alt={peer.profileName}
                  className="h-full w-full rounded-full object-cover"
                />
              </div>
            </div>
            <h3 className="mt-3 text-sm font-bold text-gray-900">@{peer.profileName}</h3>
            <span className="mt-1 inline-flex items-center rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-semibold text-orange-700">
              {peer.role || 'Learner'}
            </span>
            <p className="mt-2 text-xs text-gray-400">Joined {formatJoinDate(peer.createdAt)}</p>
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100">
            <button
              onClick={() => onConnect(peer)}
              disabled={peer.localPending}
              className={`w-full rounded-xl py-2 text-xs font-bold transition-all shadow-sm ${
                peer.localPending
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  : 'text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-orange-600 hover:text-white hover:ring-orange-600'
              }`}
            >
              {peer.localPending ? (
                <span className="flex items-center justify-center gap-1.5">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Request Sent
                </span>
              ) : 'Connect'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};