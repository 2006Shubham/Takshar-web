import { useState, useEffect } from 'react';
import { Replies } from './Replies';
import { useUser } from '../context/UserContext';

export const Comment = ({ videoId, onClose }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState('');
  const { userProfileData } = useUser();

  useEffect(() => {
    const fetchComments = async () => {
      const response = await fetch(`http://localhost:5000/api/fetchcomments?videoId=${videoId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await response.json();
      setUserId(data.userId);
      setComments(data.newComment);
    };
    fetchComments();
  }, [videoId]);

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    const response = await fetch('http://localhost:5000/api/postcomment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ text: newComment, videoId: videoId, parentId: null }),
    });
    const commentDone = await response.json();
    setComments((prev) => [commentDone, ...prev]);
    setNewComment('');
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
      <div className="relative flex w-full sm:max-w-xl max-h-[90vh] sm:max-h-[85vh] flex-col overflow-hidden rounded-t-3xl sm:rounded-2xl bg-white shadow-modal">

        {/* Drag handle (mobile) */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-gray-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-2 pb-3 border-b border-gray-100 sm:pt-4 sm:px-6">
          <div>
            <h2 className="text-base font-bold text-gray-900">Comments</h2>
            <p className="text-xs text-gray-400 font-medium mt-0.5">{comments.length} responses</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors focus:outline-none"
          >
            <span className="sr-only">Close</span>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Input Area */}
        <div className="border-b border-gray-100 bg-gray-50/60 px-5 py-3 sm:px-6">
          <form onSubmit={handlePostComment} className="flex gap-3 items-end">
            <img
              src={userProfileData.avatarUrl}
              alt="Your avatar"
              className="h-8 w-8 rounded-full object-cover ring-2 ring-white shadow-sm flex-shrink-0"
            />
            <div className="flex-1 relative">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add to the discussion…"
                className="block w-full resize-none rounded-2xl border-0 bg-white py-2.5 pl-4 pr-12 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-orange-500 outline-none transition-shadow"
                rows={1}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
              />
              <button
                type="submit"
                disabled={!newComment.trim() || isSubmitting}
                className="absolute bottom-2 right-2 rounded-xl p-1.5 text-orange-500 hover:bg-orange-50 focus:outline-none disabled:opacity-40 transition-colors"
              >
                {isSubmitting ? (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-sm font-medium">No comments yet</p>
              <p className="text-xs mt-1">Be the first to respond.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {comments.map((comment) => (
                <div key={comment._id} className="flex gap-3">
                  <img
                    src={comment.commenter?.profileUrl || 'https://i.pravatar.cc/150'}
                    alt={comment.commenter?.profileName || 'User'}
                    className="h-8 w-8 rounded-full object-cover flex-shrink-0 ring-1 ring-gray-100 shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="rounded-2xl rounded-tl-md bg-gray-50 px-4 py-3">
                      <div className="flex items-baseline justify-between gap-2 mb-1">
                        <h4 className="text-xs font-bold text-gray-900 truncate">{comment.commenter?.profileName}</h4>
                        <span className="text-[10px] font-medium text-gray-400 whitespace-nowrap flex-shrink-0">{comment.cretedAt}</span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed break-words">{comment.text}</p>
                    </div>
                    <Replies parentEntity={comment} userId={userId} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};