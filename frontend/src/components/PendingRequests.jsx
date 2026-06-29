import React from 'react';

// Added onResponse to the destructured props
export const PendingRequests = ({ pending, onResponse }) => {
    const hasRequests = pending.received.length > 0 || pending.sent.length > 0;

    if (!hasRequests) return <p className="text-center py-10 text-gray-500">No pending requests.</p>;

    return (
        <div className="space-y-10">

            {/* Received Requests */}
            {pending.received.length > 0 && (
                <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Awaiting Your Response</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pending.received.map(({ connectionId, peer }) => (
                            <div key={connectionId} className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
                                <img src={peer.profileUrl} alt="" className="h-12 w-12 rounded-full" />
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-gray-900">@{peer.username}</h4>
                                    <div className="mt-2 flex gap-2">
                                        {/* Wire up the Accept button */}
                                        <button
                                            onClick={() => onResponse(connectionId, 'Accepted')}
                                            className="text-xs font-semibold bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors"
                                        >
                                            Accept
                                        </button>

                                        {/* Wire up the Decline button */}
                                        <button
                                            onClick={() => onResponse(connectionId, 'Declined')}
                                            className="text-xs font-semibold text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
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
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Sent Requests</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pending.sent.map(({ connectionId, peer }) => (
                            <div key={connectionId} className="flex items-center justify-between rounded-2xl bg-gray-50 p-4 border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <img src={peer.profileUrl} alt="" className="h-10 w-10 rounded-full opacity-75" />
                                    <span className="text-sm font-medium text-gray-700">@{peer.username}</span>
                                </div>
                                <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">Pending</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </div>
    );
};