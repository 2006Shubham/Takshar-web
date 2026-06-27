
import { useEffect } from 'react';
import { useState } from 'react';
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

            const response = await fetch("http://localhost:5000/api/getfeed", {


                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            const data = await response.json();
            console.log(data.newVideos);
            setFeedData(data.newVideos);
            setRefetch(false);

        }
        fetchFeed();

    }, [refetch]);


    function handleOnClose() {
        setShowCommentBox(false);
    }





    async function doComment(id) {

        setShowCommentBox(true);
        setCommentOnVideo(id);


        //api to fetch comments

        // const response = await fetch("http://localhost:5000/api/docomment",{

        //         methods:'GET',
        //         headers:{
        //                     'Content-Type':'application/json'
        //         },
        //         credentials:'include'
        // })

        // const data = await response.json();

    }



    async function doLike(id) {

        try {

            const response = await fetch("http://localhost:5000/api/dolike", {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },

                credentials: 'include',

                body: JSON.stringify({ videoId: id })
            });
            const data = await response.json();
            console.log(data);

            setRefetch(true);


        } catch (error) {
            console.log("Showing the error", error);
        }

    }

    function formatDuration(seconds) {

        const hrs =
            Math.floor(seconds / 3600);

        const mins =
            Math.floor(
                (seconds % 3600) / 60
            );

        const secs =
            Math.floor(
                seconds % 60
            );

        if (hrs > 0) {
            return `${hrs}:${mins
                .toString()
                .padStart(2, "0")}:${secs
                    .toString()
                    .padStart(2, "0")}`;
        }

        return `${mins}:${secs
            .toString()
            .padStart(2, "0")}`;
    }

    console.log(
        formatDuration(255.5128)
    );



    return (<>
        <main className="min-h-screen bg-stone-50  px-4 sm:px-6">
            {/* Central feed container replacing the 500px padding */}
            <div className="mx-auto max-w-2xl flex flex-col gap-8">

                {feedData.map((item) => (
                    <article
                        key={item._id}
                        className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden"
                    >
                        {/* Card Header: The "Spark" Interaction */}
                        <header className="p-4 sm:p-5">
                            <div className="flex items-center justify-between">

                                {/* Users participating in the Spark */}
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center -space-x-2">
                                        <img
                                            className="inline-block h-10 w-10 rounded-full ring-2 ring-white object-cover"
                                            src={item.spark.sender.profileUrl}
                                            alt={item.spark.sender.username}
                                        />
                                        <img
                                            className="inline-block h-10 w-10 rounded-full ring-2 ring-white object-cover"
                                            src={item.spark.to.profileUrl}
                                            alt={item.spark.to.username}
                                        />
                                    </div>
                                    <div className="text-sm">
                                        <p className="font-medium text-gray-900">
                                            {item.spark.sender.username}{' '}
                                            <span className="text-orange-500 font-semibold mx-1">sparked</span>{' '}
                                            {item.spark.to.username}
                                        </p>
                                        <p className="text-gray-500 text-xs mt-0.5">{formatRelativeTime(item.createdAt)}</p>
                                    </div>
                                </div>

                                {/* Optional context menu button (...) */}
                                <button className="text-gray-400 hover:text-gray-600 focus:outline-none rounded-full p-1 transition-colors">
                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                    </svg>
                                </button>
                            </div>

                            {/* Topic / Title */}
                            <h2 className="mt-3 text-lg font-bold text-gray-900">
                                {item.spark.topic}
                            </h2>
                        </header>

                        {/* Video Section Container */}
                        <div
                            className="
                                    relative
                                    w-full
                                    aspect-video
                                    bg-black
                                    cursor-pointer
                                    "
                        >

                            {
                                playingVideo === item._id

                                    ?

                                    <video

                                        src={item.videoUrl}

                                        controls

                                        autoPlay

                                        playsInline

                                        className="
                                        w-full
                                        h-full
                                        object-cover
                                        "

                                        onEnded={() =>
                                            setPlayingVideo(null)
                                        }

                                    />

                                    :

                                    <>

                                        <img

                                            src={item.thumbnailUrl}

                                            alt={item.spark.topic}

                                            className="
                                                            absolute
                                                            inset-0
                                                            w-full
                                                            h-full
                                                            object-cover
                                                            "

                                        />

                                        <div

                                            className="
                                                        absolute
                                                        inset-0
                                                        flex
                                                        items-center
                                                        justify-center
                                                        "

                                        >

                                            <button

                                                onClick={() =>

                                                    setPlayingVideo(
                                                        item._id
                                                    )

                                                }

                                                className="
                                                    rounded-full
                                                    bg-white/20
                                                    backdrop-blur
                                                    p-5
                                                    hover:scale-110
                                                    transition
                                                    "

                                            >

                                                <svg
                                                    className="
w-10
h-10
text-white
"
                                                    fill="currentColor"
                                                    viewBox="0 0 24 24"
                                                >

                                                    <path d="M8 5v14l11-7z" />

                                                </svg>

                                            </button>

                                        </div>

                                        <div
                                            className="
absolute
bottom-3
right-3
bg-black/70
text-white
px-2
py-1
rounded
"
                                        >

                                            {
                                                formatDuration(
                                                    item.duration
                                                )
                                            }

                                        </div>

                                    </>

                            }

                        </div>

                        {/* Engagement Footer */}
                        <footer className="px-4 py-3 sm:px-5 flex items-center gap-6 border-t border-gray-100 bg-gray-50/50">
                            <button onClick={() => { doLike(item._id) }} className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors group">
                                {
                                    item.isLikedByMe ?
                                        <svg className="h-5 w-5 text-orange-400 group-hover:text-orange-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                        </svg>
                                        :
                                        <svg className="h-5 w-5 text-gray-400 group-hover:text-orange-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                        </svg>

                                }
                                {item.likes.length}
                            </button>

                            <button onClick={() => doComment(item._id)} className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors group">
                                <svg className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                {item.comments}
                            </button>

                            <button className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-green-600 transition-colors group ml-auto">
                                <svg className="h-5 w-5 text-gray-400 group-hover:text-green-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                </svg>
                            </button>
                        </footer>
                    </article>
                ))}


                {
                    showCommentBox &&
                    (
                        <Comment videoId={commentOnVideo} onClose={handleOnClose} />
                    )
                }

            </div>
        </main>

    </>
    );
};