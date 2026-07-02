import { useState, useEffect } from "react";

import { UploadVideo } from "../UploadVideo";
import { formatRelativeTime } from "../../utils/dateUtils";

import { useUpload } from "../../context/UploadContext"; // 

export const ReceivedSparks = () => {


  const [sparks, setReceivedSparks] = useState([]);

  const [showUpload, setShowUpload] = useState(false);

  const [completingSpark, setCompletingSpark] = useState({});

  const { uploads } = useUpload();


  useEffect(() => {
    setReceivedSparks(prevSparks => {
      let hasChanges = false;

      const nextSparks = prevSparks.map(spark => {
        const activeUpload = uploads[spark._id];

        // If the background context says this spark's upload is a success, update it!
        if (activeUpload && activeUpload.status === 'success' && spark.status !== 'success') {
          hasChanges = true;
          return { ...spark, status: 'success' };
        }
        return spark;
      });

      // Only trigger a re-render if a status actually changed
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
          headers: {
            'Content_Type': 'application/json'
          },
          credentials: 'include'
        });

        const data = await response.json();

        if (response.ok) {
          console.log("The data fetched", data);
        }


        setReceivedSparks(data);

      } catch (error) {
        console.log("Error fetching received sparks", error);
      }

    }
    fetchRecivedSparks();
  }, [])



  async function onStatusChange(sparkid, status) {

    try {
      const response = await fetch("http://localhost:5000/api/changesparkstatus", {

        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          newStatus: status,
          id: sparkid

        }),
        credentials: 'include'
      }
      )


      const data = await response.json();
      if (response.ok) {
        console.log(sparks);

        const updatedSpark = data.updatedSpark;

        setReceivedSparks(prev => prev.map(spark => spark._id === sparkid ? updatedSpark : spark))


      }

    } catch (error) {
      console.log("Error changing status", error);
    }


  }



  if (!sparks || sparks.length === 0) {
    return <p className="text-gray-500 text-center py-8">You have no pending challenges right now.</p>;
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {sparks.map((spark) => (
        <div key={spark._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition-colors bg-white">
          <div className="flex items-start gap-4">
            <img src={spark.sender.profileUrl} alt="" className="h-10 w-10 rounded-full mt-1 object-cover" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {spark.sender.profileName} <span className="text-orange-500 font-bold">sparks you</span>
              </p>
              <p className="text-base font-bold text-gray-900 mt-1 leading-tight">{spark.topic}</p>
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {formatRelativeTime(spark.createdAt)}
              </p>
            </div>
          </div>



          <div className="flex items-center gap-3 border-t sm:border-t-0 border-gray-100 pt-3 sm:pt-0">
            {spark.status === 'Pending' && (
              <>
                <button
                  onClick={() => onStatusChange(spark._id, 'declined')}
                  className="text-sm font-medium text-gray-600 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Decline
                </button>
                <button
                  onClick={() => onStatusChange(spark._id, 'accepted')}
                  className="text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 px-4 py-1.5 rounded-lg shadow-sm transition-colors"
                >
                  Accept
                </button>
              </>
            )}

            {spark.status === 'accepted' && (
              <button
                onClick={() => {
                  uploadVidio(spark);
                  ;

                }}
                className="inline-flex items-center gap-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-500 px-4 py-2 rounded-lg shadow-sm transition-all"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                Upload Video
              </button>
            )}

            {spark.status === 'success' && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                Completed
              </span>
            )}

            {spark.status === 'declined' && (
              <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                Declined
              </span>
            )}
          </div>
        </div>



      ))}

      {showUpload && (

        <UploadVideo spark={completingSpark} onClose={() => setShowUpload(false)} />

      )}

    </div>
  );
};