
import { ProfileSidebar } from './ProfileSidebar';
import { Feed } from './Feed'; // Assuming your Feed component is in this file
import { SparkCompass } from './SparkTrack/SparkCompass';

export const FeedLayout = () => {
    return (
        <div className="min-h-screen bg-stone-50 pt-6 pb-12 px-4 sm:px-6 lg:px-8">
            {/* The main grid container.
        - max-w-7xl keeps it from stretching infinitely on huge monitors.
        - On mobile (default), it's a 1-column layout.
        - On medium screens (md:), we switch to a 12-column grid.
      */}
            <div className="mx-auto max-w-7xl grid grid-cols-1 p-4
            md:grid-cols-12 gap-6">

                {/* LEFT SIDEBAR: Profile Summary
          Takes up 3 columns out of 12 on desktop.
          Hidden on mobile to prioritize the feed.
        */}
                <aside className=" md:block md:col-span-4 lg:col-span-3 col-span:9">
                    <ProfileSidebar />
                </aside>

                {/* CENTER CONTENT: The Main Feed
          Takes up the remaining space (8 cols on md, 6 cols on lg).
        */}
                <main className="md:col-span-8 lg:col-span-6 ">
                    <Feed />
                </main>

                {/* RIGHT SIDEBAR (Optional)
          Takes up 3 columns on large screens. You can leave this empty 
          for now, or use it later for "Trending Sparks" or "Suggested Friends".
        */}
                <aside className="hidden lg:block lg:col-span-3">
                    {/* Example placeholder for future right-side widgets */}
                    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200 sticky top-20">
                        <h3 className="font-bold text-gray-900 mb-2">Trending Challenges</h3>
                        <p className="text-sm text-gray-500">More widgets coming soon...</p>
                    </div>

                </aside>

            </div>
        </div>
    );
};