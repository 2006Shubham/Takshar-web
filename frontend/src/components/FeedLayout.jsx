import { ProfileSidebar } from './ProfileSidebar';
import { Feed } from './Feed';
import { SparkCompass } from './SparkTrack/SparkCompass';

export const FeedLayout = () => {
  return (
    <div className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* LEFT: Profile Sidebar — 3 cols */}
          <aside className="md:col-span-3">
            <ProfileSidebar />
          </aside>

          {/* CENTER: Feed — 6 cols */}
          <main className="md:col-span-6">
            <Feed />
          </main>

          {/* RIGHT: Spark Compass widget — 3 cols */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-[76px] space-y-4">
              <SparkCompass />
              {/* Footer links */}
              <p className="text-xs text-gray-400 leading-relaxed px-1">
                Spark · Learn by doing · Build in public
              </p>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
};