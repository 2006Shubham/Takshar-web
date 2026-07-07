import { useEffect, useState } from 'react';
import { Comment } from './Comment';
import { formatRelativeTime } from '../utils/dateUtils';

export const Feed = () => {
  const [feedData, setFeedData] = useState([]);
  const [playingVideo, setPlayingVideo] = useState('');
  const [refetch, setRefetch] = useState(false);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [commentOnVideo, setCommentOnVideo] = useState([]);

  useEffect(() => {
    const fetchFeed = async () => {
      const response = await fetch('http://localhost:5000/api/getfeed', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await response.json();
      setFeedData(data.newVideos);
      setRefetch(false);
    };
    fetchFeed();
  }, [refetch]);

  function handleOnClose() {
    setShowCommentBox(false);
  }

  async function doComment(id) {
    setShowCommentBox(true);
    setCommentOnVideo(id);
  }

  async function doLike(id) {
    try {
      const response = await fetch('http://localhost:5000/api/dolike', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ videoId: id }),
      });
      await response.json();
      setRefetch(true);
    } catch (error) {
      console.log('Like error', error);
    }
  }

  function formatDuration(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  }

  // Empty state
  if (feedData && feedData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="h-16 w-16 rounded-2xl bg-orange-50 flex items-center justify-center mb-4">
          <svg className="h-8 w-8 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-gray-900">No sparks yet</h3>
        <p className="mt-1 text-sm text-gray-500 max-w-xs">
          When you and your peers complete challenges, they'll appear here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-5">
        {feedData && feedData.map((item) => (
          <article
            key={item._id}
            className="rounded-2xl bg-white shadow-card ring-1 ring-gray-200/80 overflow-hidden hover:shadow-card-hover transition-shadow duration-200"
          >
            {/* Card Header */}
            <header className="px-5 pt-5 pb-3">
              <div className="flex items-start justify-between gap-3">

                {/* Avatars + Names */}
                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    <img
                      className="h-9 w-9 rounded-full object-cover ring-2 ring-white shadow-sm"
                      src={item.spark.sender.profileUrl}
                      alt={item.spark.sender.profileName}
                    />
                    <img
                      className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full object-cover ring-2 ring-white shadow-sm"
                      src={item.spark.to.profileUrl}
                      alt={item.spark.to.username}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 leading-snug">
                      {item.spark.sender.profileName}{' '}
                      <span className="font-bold text-orange-500">sparked</span>{' '}
                      {item.spark.to.profileName}
                    </p>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">
                      {formatRelativeTime(item.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Three-dot menu */}
                <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0">
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              </div>

              {/* Topic */}
              <h2 className="mt-3 text-base font-bold text-gray-900 leading-snug">
                {item.spark.topic}
              </h2>
            </header>

            {/* Video */}
            <div className="relative w-full aspect-video bg-gray-900">
              {playingVideo === item._id ? (
                <video
                  src={item.videoUrl}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                  onEnded={() => setPlayingVideo(null)}
                />
              ) : (
                <>
                  <img
                    src={item.thumbnailUrl}
                    alt={item.spark.topic}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                  {/* Play button */}
                  <button
                    onClick={() => setPlayingVideo(item._id)}
                    className="absolute inset-0 flex items-center justify-center group"
                  >
                    <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/30 group-hover:scale-105 group-hover:bg-white/30 transition-all duration-200 shadow-lg">
                      <svg className="h-6 w-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </button>

                  {/* Duration */}
                  <div className="absolute bottom-3 right-3 rounded-md bg-black/70 px-2 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
                    {formatDuration(item.duration)}
                  </div>
                </>
              )}
            </div>

            {/* Engagement footer */}
            <footer className="flex items-center gap-1 px-4 py-3 border-t border-gray-100">
              {/* Like */}
              <button
                onClick={() => doLike(item._id)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors group ${
                  item.isLikedByMe
                    ? 'text-orange-600 bg-orange-50 hover:bg-orange-100'
                    : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                }`}
              >
                <svg
                  className={`h-4 w-4 transition-transform group-hover:scale-110 ${item.isLikedByMe ? 'fill-orange-500 text-orange-500' : ''}`}
                  fill={item.isLikedByMe ? 'currentColor' : 'none'}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>{item.likes.length}</span>
              </button>

              {/* Comment */}
              <button
                onClick={() => doComment(item._id)}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors group"
              >
                <svg className="h-4 w-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>{item.comments}</span>
              </button>

              {/* Share */}
              <button className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors ml-auto group">
                <svg className="h-4 w-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span className="text-xs">Share</span>
              </button>
            </footer>
          </article>
        ))}
      </div>

      {showCommentBox && (
        <Comment videoId={commentOnVideo} onClose={handleOnClose} />
      )}
    </>
  );
};