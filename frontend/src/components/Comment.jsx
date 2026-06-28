import { useState, useEffect } from 'react';
import { Replies } from './Replies';

export const Comment = ({ videoId, onClose }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [userId, setUserId] = useState('');

    useEffect(() => {
        const fetchComments = async () => {
            const response = await fetch(`http://localhost:5000/api/fetchcomments?videoId=${videoId}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });
            const data = await response.json();

            setUserId(data.userId);
            setComments(data.newComment);
        }
        fetchComments();
    }, [videoId]);

    const handlePostComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setIsSubmitting(true);

        const response = await fetch("http://localhost:5000/api/postcomment", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                text: newComment,
                videoId: videoId,
                parentId: null
            })
        });

        const commentDone = await response.json();
        setComments((prevComments) => [commentDone, ...prevComments]);
        setNewComment('');
        setIsSubmitting(false);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4 sm:p-6 transition-all">
            <div className="relative flex w-full max-w-2xl max-h-[85vh] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">

                {/* Sticky Header */}
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-white z-10 shrink-0">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Comments</h2>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">{comments.length} responses</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
                    >
                        <span className="sr-only">Close comments</span>
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Input Area (Top) */}
                <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4 shrink-0">
                    <form onSubmit={handlePostComment} className="flex gap-4">
                        <img
                            src="https://i.pravatar.cc/150?u=takshar_demo"
                            alt="Your avatar"
                            className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-sm flex-shrink-0"
                        />
                        <div className="flex-1 relative">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add to the discussion..."
                                className="block w-full resize-none rounded-xl border-0 bg-white py-3 pl-4 pr-12 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-orange-500 transition-shadow outline-none"
                                rows={1}
                                onInput={(e) => {
                                    e.target.style.height = 'auto';
                                    e.target.style.height = (e.target.scrollHeight) + 'px';
                                }}
                            />
                            <button
                                type="submit"
                                disabled={!newComment.trim() || isSubmitting}
                                className="absolute bottom-2 right-2 rounded-lg p-1.5 text-orange-600 hover:bg-orange-50 focus:outline-none disabled:opacity-40 transition-colors"
                            >
                                {isSubmitting ? (
                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                ) : (
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Scrollable Comments List */}
                <div className="flex-1 overflow-y-auto px-6 py-6">
                    <div className="space-y-6">
                        {comments.map((comment) => (
                            <div key={comment._id} className="flex gap-4">
                                <img
                                    src={comment.commenter?.profileUrl || 'https://i.pravatar.cc/150'}
                                    alt={comment.commenter?.username || 'User'}
                                    className="h-10 w-10 rounded-full object-cover mt-1 flex-shrink-0 shadow-sm"
                                />
                                <div className="flex-1 min-w-0">

                                    {/* Top Level Comment Bubble */}
                                    <div className="rounded-2xl rounded-tl-none bg-gray-50 px-4 py-3 hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="text-sm font-bold text-gray-900 truncate pr-2">{comment.commenter?.username}</h4>
                                            <span className="text-xs font-medium text-gray-500 whitespace-nowrap">{comment.cretedAt}</span>
                                        </div>
                                        <p className="text-sm text-gray-700 leading-relaxed break-words">
                                            {comment.text}
                                        </p>
                                    </div>

                                    {/* Unified Action Bar + Recursion */}
                                    <Replies parentEntity={comment} userId={userId} />

                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};