import { useState, useEffect } from 'react';
import { UploadVideo } from '../UploadVideo';
import { formatRelativeTime } from '../../utils/dateUtils';
import { useUpload } from '../../context/UploadContext';

const STATUS_CONFIG = {
  Pending: {
    dot: 'bg-yellow-400',
    label: 'Pending',
    border: 'border-l-yellow-400',
  },
  accepted: {
    dot: 'bg-blue-400',
    label: 'Accepted',
    border: 'border-l-blue-400',
  },
  success: {
    dot: 'bg-green-500',
    label: 'Completed',
    border: 'border-l-green-400',
  },
  declined: {
    dot: 'bg-red-400',
    label: 'Declined',
    border: 'border-l-red-400',
  },
};

export const ReceivedSparks = () => {
  const [sparks, setReceivedSparks] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [completingSpark, setCompletingSpark] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const { uploads } = useUpload();

  useEffect(() => {
    setReceivedSparks((prevSparks) => {
      let hasChanges = false;
      const nextSparks = prevSparks.map((spark) => {
        const activeUpload = uploads[spark._id];
        if (activeUpload && activeUpload.status === 'success' && spark.status !== 'success') {
          hasChanges = true;
          return { ...spark, status: 'success' };
        }
        return spark;
      });
      return hasChanges ? nextSparks : prevSparks;
    });
  }, [uploads]);

  async function uploadVidio(spark) {
    setCompletingSpark(spark);
    setShowUpload(true);
  }

  useEffect(() => {
    const fetchRecivedSparks = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/receivedsparks', {
          method: 'GET',
          headers: { 'Content_Type': 'application/json' },
          credentials: 'include',
        });
        const data = await response.json();
        setReceivedSparks(data);
      } catch (error) {
        console.log('Error fetching received sparks', error);
      }
    };
    fetchRecivedSparks();
  }, []);

  async function onStatusChange(sparkid, status) {
    try {
      const response = await fetch('http://localhost:5000/api/changesparkstatus', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newStatus: status, id: sparkid }),
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok) {
        const updatedSpark = data.updatedSpark;
        setReceivedSparks((prev) =>
          prev.map((spark) => (spark._id === sparkid ? updatedSpark : spark))
        );
      }
    } catch (error) {
      console.log('Error changing status', error);
    }
  }

  if (!sparks || sparks.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
          <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-gray-500">No challenges yet</p>
        <p className="text-xs text-gray-400 mt-1">When peers spark you, they'll appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sparks.map((spark) => {
        const config = STATUS_CONFIG[spark.status] || STATUS_CONFIG.Pending;
        return (
          <div
            key={spark._id}
            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border-l-4 ${config.border} border border-gray-200 bg-white p-4 hover:shadow-sm transition-shadow`}
          >
            <div className="flex items-start gap-3.5">
              <img
                src={spark.sender.profileUrl}
                alt=""
                className="h-10 w-10 rounded-full object-cover flex-shrink-0 mt-0.5 ring-2 ring-gray-100"
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">
                  {spark.sender.profileName}{' '}
                  <span className="font-bold text-orange-500">sparked you</span>
                </p>
                <p className="text-sm font-bold text-gray-900 mt-0.5 leading-snug">{spark.topic}</p>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatRelativeTime(spark.createdAt)}
                </p>
              </div>
            </div>

            {/* Status / Actions */}
            <div className="flex items-center gap-2 flex-shrink-0 pl-14 sm:pl-0">
              {spark.status === 'Pending' && (
                <>
                  <button
                    onClick={() => onStatusChange(spark._id, 'declined')}
                    className="text-xs font-semibold text-gray-600 px-3.5 py-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors border border-gray-200"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => onStatusChange(spark._id, 'accepted')}
                    className="text-xs font-semibold text-white bg-gray-900 px-4 py-1.5 rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
                  >
                    Accept
                  </button>
                </>
              )}

              {spark.status === 'accepted' && (
                <button
                  disabled={isUploading}
                  onClick={() => uploadVidio(spark)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-500 px-4 py-2 rounded-lg shadow-sm transition-all"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Upload Video
                </button>
              )}

              {spark.status === 'success' && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 ring-1 ring-green-600/20">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  Completed
                </span>
              )}

              {spark.status === 'declined' && (
                <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">
                  Declined
                </span>
              )}
            </div>
          </div>
        );
      })}

      {showUpload && (
        <UploadVideo
          onUploadStart={() => setIsUploading(true)}
          spark={completingSpark}
          onClose={() => setShowUpload(false)}
        />
      )}
    </div>
  );
};