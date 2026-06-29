import { useState, useEffect } from 'react';
import { formatRelativeTime } from '../utils/dateUtils';

// Added onLikeToggle to the props
export const Replies = ({ parentEntity, userId, onLikeToggle }) => {
    const [replies, setReplies] = useState([]);
    const [showReplies, setShowReplies] = useState(false);
    const [newReply, setNewReply] = useState('');
    const [isReplying, setIsReplying] = useState(false);

    const checkInitialLike = () => {
        if (parentEntity?.isLikedByMe !== undefined) {
            return parentEntity.isLikedByMe;
        }
        if (parentEntity?.likes && Array.isArray(parentEntity.likes) && userId) {
            return parentEntity.likes.some(id => id.toString() === userId.toString());
        }
        return false;
    };

    const [isLiked, setIsLiked] = useState(checkInitialLike());
    const [likeCount, setLikeCount] = useState(parentEntity?.likes?.length || 0);

    useEffect(() => {
        fetch(`http://localhost:5000/api/fetchreplies?parentId=${parentEntity._id}`)
            .then(res => res.json())
            .then(data => setReplies(data));
    }, [parentEntity._id]);

    // 🐛 THE FIX: Function to update this component's local replies array 
    // when a child nested reply is liked.
    const handleChildLikeToggle = (childId, isNowLiked) => {
        setReplies(prevReplies => prevReplies.map(reply => {
            if (reply._id === childId) {
                // Manually add or remove the userId from the likes array to keep it fresh
                const newLikes = isNowLiked
                    ? [...(reply.likes || []), userId]
                    : (reply.likes || []).filter(id => id.toString() !== userId.toString());

                return { ...reply, isLikedByMe: isNowLiked, likes: newLikes };
            }
            return reply;
        }));
    };

    const handleToggleLike = async () => {
        const wasLiked = isLiked;
        const isNowLiked = !wasLiked; // New state

        // 1. Optimistically update local UI instantly
        setIsLiked(isNowLiked);
        setLikeCount(prev => wasLiked ? Math.max(0, prev - 1) : prev + 1);

        // 2. Notify the parent to update its array so it survives being hidden/shown!
        if (onLikeToggle) {
            onLikeToggle(parentEntity._id, isNowLiked);
        }

        try {
            await fetch("http://localhost:5000/api/dolikecomment", {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ commentId: parentEntity._id })
            });
        } catch (error) {
            console.error("Failed to toggle like", error);
            // Revert on failure
            setIsLiked(wasLiked);
            setLikeCount(prev => wasLiked ? prev + 1 : Math.max(0, prev - 1));

            // Revert parent array on failure
            if (onLikeToggle) {
                onLikeToggle(parentEntity._id, wasLiked);
            }
        }
    };

    const handlePostReply = async (e) => {
        e.preventDefault();
        if (!newReply.trim()) return;

        const response = await fetch("http://localhost:5000/api/postcomment", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                text: newReply,
                parentId: parentEntity._id,
                videoId: null
            })
        });

        const savedReply = await response.json();
        setReplies([...replies, savedReply]);
        setNewReply('');
        setIsReplying(false);
        setShowReplies(true);
    };

    return (
        <div className="mt-1.5 w-full">

            {/* UNIVERSAL ACTION BAR */}
            <div className="flex items-center justify-left gap-4 px-2">

                <button
                    onClick={handleToggleLike}
                    className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-orange-600 transition-colors group"
                >
                    <svg
                        className={`h-4 w-4 transition-transform group-hover:scale-110 ${isLiked ? 'text-orange-500 fill-orange-500' : 'text-gray-400'}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {likeCount > 0 && <span className={isLiked ? 'text-orange-600' : ''}>{likeCount}</span>}
                </button>

                <button
                    onClick={() => setIsReplying(!isReplying)}
                    className="text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
                >
                    Reply
                </button>

                {replies.length > 0 && (
                    <button
                        onClick={() => setShowReplies(!showReplies)}
                        className="text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors "
                    >
                        {showReplies ? "Hide replies" : `View ${replies.length} replies`}
                    </button>
                )}
            </div>

            {/* Inline Reply Input */}
            {isReplying && (
                <form onSubmit={handlePostReply} className="flex gap-2 items-start mt-3 mb-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <img src="https://i.pravatar.cc/150?u=you" className="h-6 w-6 rounded-full mt-1.5 shadow-sm" alt="You" />
                    <div className="flex-1">
                        <textarea
                            autoFocus
                            value={newReply}
                            onChange={(e) => setNewReply(e.target.value)}
                            className="w-full text-sm px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-inset focus:ring-orange-500 outline-none resize-none shadow-sm transition-shadow"
                            placeholder="Add a reply..."
                            rows={2}
                        />
                        <div className="flex gap-2 mt-2 justify-end">
                            <button type="button" onClick={() => setIsReplying(false)} className="text-xs font-semibold text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg transition-colors">Cancel</button>
                            <button type="submit" disabled={!newReply.trim()} className="text-xs font-bold bg-orange-600 text-white px-4 py-1.5 rounded-full hover:bg-orange-500 shadow-sm disabled:opacity-50 transition-colors">Post</button>
                        </div>
                    </div>
                </form>
            )}

            {/* Recursive Replies Tree */}
            {showReplies && (
                <div className="ml-4 border-l-2 border-gray-100 pl-4 mt-3 space-y-4">
                    {replies.map((reply) => (
                        <div key={reply._id} className="group">
                            <div className="flex gap-3 items-start">
                                <img src={reply.commenter?.profileUrl || 'https://i.pravatar.cc/150'} className="h-8 w-8 rounded-full shadow-sm object-cover mt-1" alt={reply.commenter?.username} />
                                <div className="flex-1 min-w-0">
                                    <div className="bg-gray-50 hover:bg-gray-100 px-4 py-3 rounded-2xl rounded-tl-none transition-colors">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-bold text-gray-900 truncate pr-2">{reply.commenter?.username}</span>
                                            <span className="text-xs font-medium text-gray-500 whitespace-nowrap">{reply.createdAt ? formatRelativeTime(reply.createdAt) : 'Just now'}</span>
                                        </div>
                                        <p className="text-sm text-gray-700 leading-relaxed break-words">{reply.text}</p>
                                    </div>

                                    {/* 🐛 THE FIX: Pass the handleChildLikeToggle down the tree */}
                                    <Replies
                                        parentEntity={reply}
                                        userId={userId}
                                        onLikeToggle={handleChildLikeToggle}
                                    />

                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};