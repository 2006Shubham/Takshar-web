import React from 'react';

export const PendingRequests = ({ pending, onResponse }) => {
  const hasRequests = pending.received.length > 0 || pending.sent.length > 0;

  if (!hasRequests) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <div className="h-12 w-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
          <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-gray-500">All clear!</p>
        <p className="text-xs text-gray-400 mt-1">No pending connection requests.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Received Requests */}
      {pending.received.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
            Awaiting Your Response — {pending.received.length}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pending.received.map(({ connectionId, peer }) => (
              <div key={connectionId} className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-card ring-1 ring-gray-200/80 border-l-4 border-l-orange-400">
                <img src={peer.profileUrl} alt="" className="h-12 w-12 rounded-full object-cover flex-shrink-0 ring-2 ring-gray-100" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 truncate">@{peer.profileName}</h4>
                  {peer.role && (
                    <p className="text-xs text-gray-400 truncate mt-0.5">{peer.role}</p>
                  )}
                  <div className="mt-2.5 flex gap-2">
                    <button
                      onClick={() => onResponse(connectionId, 'Accepted')}
                      className="text-xs font-bold bg-gray-900 text-white px-3.5 py-1.5 rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => onResponse(connectionId, 'Declined')}
                      className="text-xs font-bold text-gray-600 px-3 py-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors border border-gray-200"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sent Requests */}
      {pending.sent.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
            Sent Requests — {pending.sent.length}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pending.sent.map(({ connectionId, peer }) => (
              <div key={connectionId} className="flex items-center justify-between rounded-2xl bg-gray-50 p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <img src={peer.profileUrl} alt="" className="h-10 w-10 rounded-full object-cover opacity-80" />
                  <span className="text-sm font-semibold text-gray-700">@{peer.profileName}</span>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full ring-1 ring-orange-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-pulse" />
                  Pending
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};