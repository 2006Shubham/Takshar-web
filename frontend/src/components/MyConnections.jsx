import React from 'react';
import { formatJoinDate } from '../utils/dateUtils';

export const MyConnections = ({ connections }) => {
  if (connections.length === 0) return <p className="text-center py-10 text-gray-500">You haven't made any connections yet.</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {connections.map(({ connectionId, peer }) => (
        <div key={connectionId} className="flex flex-col rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <div className="flex flex-col items-center text-center">
            <img src={peer.profileUrl} alt={peer.username} className="h-20 w-20 rounded-full object-cover ring-4 ring-gray-50" />
            <h3 className="mt-4 text-base font-bold text-gray-900">@{peer.username}</h3>
            <span className="mt-1 text-xs text-gray-500">{peer.role}</span>
          </div>
          <div className="mt-6">
            <button className="w-full rounded-xl bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100">
              Message
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};