import { useEffect, useState } from 'react';

export const SentSparks = () => {

  const [sparks, setSentSparks] = useState([]);


  useEffect(() => {

    const fetchSentSparks = async () => {

      try {
        const response = await fetch("http://localhost:5000/api/sentsparks", {

          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'

        });
        const data = await response.json();
        if (response.ok) {
          console.log("Sent Sparks", data.usersSentSparks);
        }

        setSentSparks(data.usersSentSparks);

      } catch (error) {
        console.log("cant fetch sent sparks", error);
      }

    }
    fetchSentSparks();
  }, []);

  if (!sparks || sparks.length === 0) {
    return <p className="text-gray-500 text-center py-8">You haven't challenged anyone yet.</p>;
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {sparks.map((spark) => (
        <div key={spark._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50 p-5">
          <div className="flex items-start gap-4 opacity-90">
            <img src={spark.to.profileUrl} alt="" className="h-10 w-10 rounded-full mt-1 object-cover ring-2 ring-white shadow-sm" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                You challenged <span className="font-semibold">{spark.to.username}</span>
              </p>
              <p className="text-base font-bold text-gray-900 mt-1 leading-tight">{spark.topic}</p>
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Sent {spark.createdAt}
              </p>
            </div>
          </div>

          <div className="flex items-center pt-2 sm:pt-0">
            {spark.status === 'pending' && (
              <span className="inline-flex items-center rounded-full bg-yellow-50 px-3 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                Awaiting Response
              </span>
            )}
            {spark.status === 'accepted' && (
              <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                Accepted - Awaiting Video
              </span>
            )}
            {spark.status === 'success' && (
              <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                Completed
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};