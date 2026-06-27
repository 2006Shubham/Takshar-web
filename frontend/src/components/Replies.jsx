import { useState, useEffect } from 'react';
import { formatRelativeTime } from '../utils/dateUtils';

export const Replies = ({ parentId }) => {
    const [replies, setReplies] = useState([]);
    const [showReplies, setShowReplies] = useState(true);
    const [newReply, setNewReply] = useState('');
    const [isReplying, setIsReplying] = useState(false);

    useEffect(() => {
        // You are now hitting the same backend logic, just passing the parentId
        fetch(`http://localhost:5000/api/fetchreplies?parentId=${parentId}`)
            .then(res => res.json())
            .then(data => setReplies(data));
    }, [parentId]);

    const handlePostReply = async (e) => {
        e.preventDefault();
        const response = await fetch("http://localhost:5000/api/postcomment", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                text: newReply,
                parentId: parentId,// <--- This links it to the comment/reply
                videoId: null
            })
        });
        const savedReply = await response.json();
        setReplies([...replies, savedReply]);
    };

    return (
        <div className="ml-4 border-l border-gray-200 pl-4 mt-3 space-y-3">
            {/* Action Bar */}
            <div className="flex items-center gap-3">
                {!isReplying && (
                    <button
                        onClick={() => setIsReplying(true)}
                        className="text-[11px] font-bold text-gray-500 hover:text-orange-600 uppercase tracking-wide transition-colors"
                    >
                        Reply
                    </button>
                )}

                {replies.length > 0 && !isReplying && (
                    <button
                        onClick={() => setShowReplies(!showReplies)}
                        className="text-[11px] font-bold text-gray-400 hover:text-gray-600 uppercase tracking-wide"
                    >
                        {showReplies ? "Hide Replies" : `${replies.length} Replies`}
                    </button>
                )}
            </div>

            {/* Input Form */}
            {isReplying && (
                <form onSubmit={handlePostReply} className="flex gap-2 items-start mt-2">
                    <img src="https://i.pravatar.cc/150?u=you" className="h-6 w-6 rounded-full mt-1" alt="You" />
                    <div className="flex-1">
                        <textarea
                            autoFocus
                            value={newReply}
                            onChange={(e) => setNewReply(e.target.value)}
                            className="w-full text-sm p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 outline-none resize-none"
                            placeholder="Add a reply..."
                            rows={2}
                        />
                        <div className="flex gap-2 mt-1 justify-end">
                            <button type="button" onClick={() => setIsReplying(false)} className="text-xs font-bold text-gray-400 hover:text-gray-600 px-3 py-1">Cancel</button>
                            <button type="submit" className="text-xs font-bold bg-orange-600 text-white px-3 py-1 rounded-full hover:bg-orange-700 shadow-sm">Post</button>
                        </div>
                    </div>
                </form>
            )}

            {/* Replies List */}
            {showReplies && replies.map((reply) => (
                <div key={reply._id} className="group">
                    <div className="flex gap-3 items-start">
                        <img src={reply.commenter.profileUrl} className="h-7 w-7 rounded-full shadow-sm" alt={reply.commenter.username} />
                        <div className="flex-1 bg-white hover:bg-gray-50 p-2 rounded-lg transition-colors">
                            <div className="flex items-baseline gap-2">
                                <span className="text-xs font-bold text-gray-900">{reply.commenter.username}</span>
                                <span className="text-[10px] text-gray-400">{formatRelativeTime(reply.createdAt)}</span>
                            </div>
                            <p className="text-sm text-gray-700 leading-snug mt-0.5">{reply.text}</p>
                        </div>
                    </div>
                    {/* Nested Recursion */}
                    <Replies parentId={reply._id} />
                </div>
            ))}
        </div>
    );
};