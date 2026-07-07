import { useEffect, useState } from 'react';
import { formatRelativeTime } from '../../utils/dateUtils';

export const SentSparks = () => {
  const [sparks, setSentSparks] = useState([]);

  useEffect(() => {
    const fetchSentSparks = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/sentsparks', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        const data = await response.json();
        setSentSparks(data.usersSentSparks);
      } catch (error) {
        console.log("Can't fetch sent sparks", error);
      }
    };
    fetchSentSparks();
  }, []);

  if (!sparks || sparks.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
          <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-gray-500">No sparks sent yet</p>
        <p className="text-xs text-gray-400 mt-1">Head to "Create Spark" to challenge a peer.</p>
      </div>
    );
  }

  const STATUS_BADGE = {
    pending: (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-800 ring-1 ring-yellow-600/20">
        <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
        Awaiting Response
      </span>
    ),
    accepted: (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-600/20">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
        Accepted
      </span>
    ),
    success: (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 ring-1 ring-green-600/20">
        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
        </svg>
        Completed
      </span>
    ),
  };

  return (
    <div className="space-y-3">
      {sparks.map((spark) => (
        <div
          key={spark._id}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4"
        >
          <div className="flex items-start gap-3.5">
            <img
              src={spark.to.profileUrl}
              alt=""
              className="h-10 w-10 rounded-full object-cover flex-shrink-0 ring-2 ring-white shadow-sm"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-700">
                You{' '}
                <span className="font-bold text-orange-500">sparked {spark.to.profileName}</span>
              </p>
              <p className="text-sm font-bold text-gray-900 mt-0.5 leading-snug">{spark.topic}</p>
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Sent {formatRelativeTime(spark.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex-shrink-0 pl-14 sm:pl-0">
            {STATUS_BADGE[spark.status] || null}
          </div>
        </div>
      ))}
    </div>
  );
};