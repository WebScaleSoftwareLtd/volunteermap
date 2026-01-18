'use client';

import { GoogleMapsProvider } from '@/components/map';
import { AlgoliaProvider, SearchBox, GeoSearch, Hits, CategoryFilter } from '@/components/search';

export function HomePage() {
  return (
    <GoogleMapsProvider>
      <AlgoliaProvider>
        {/* Full-viewport map with overlay panel (ported from old homepage layout). */}
        <div className="relative w-full h-[calc(100dvh-4rem)] overflow-hidden">
          {/* Overlay */}
          <div className="absolute inset-0 pt-6 z-10 pointer-events-none">
            <div className="h-4/6 overflow-y-auto scrollbar-nuke">
              <div className="block ml-auto mr-auto sm:mr-8 max-w-lg pointer-events-auto rounded">
                <div className="bg-white/95 backdrop-blur border border-gray-200 p-4 mx-4 dark:bg-gray-900/90 dark:border-gray-800">
                  <p className="text-center text-sm text-gray-700 dark:text-gray-200">
                    VolunteerMap is open source.{' '}
                    <a
                      href="https://github.com/WebScaleSoftwareLtd/volunteermap"
                      className="text-blue-600 hover:underline dark:text-blue-400"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Check out the source code on GitHub
                    </a>
                    .
                  </p>

                  <hr className="my-4 border-gray-200 dark:border-gray-800" />

                  <SearchBox />
                  <div className="mt-4">
                    <CategoryFilter />
                  </div>
                </div>

                <div className="bg-white/95 backdrop-blur border border-gray-200 border-t-0 p-4 mx-4 dark:bg-gray-900/90 dark:border-gray-800">
                  <Hits />
                </div>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="absolute inset-0">
            <GeoSearch />
          </div>
        </div>
      </AlgoliaProvider>
    </GoogleMapsProvider>
  );
}
