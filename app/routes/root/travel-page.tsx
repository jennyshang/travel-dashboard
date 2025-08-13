// routes/travels/travel-page.tsx
import { Link, type LoaderFunctionArgs, useSearchParams } from "react-router";
import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
import { cn, parseTripData } from "~/lib/utils";
import { Header, SearchBar, TripCard } from "../../../components";
import { getAllTrips } from "~/appwrite/trips";
import type { Route } from "../../../.react-router/types/app/routes/admin/+types/trips";
import React, { useEffect, useMemo, useState } from "react";
import { getUser } from "~/appwrite/auth";
import { PagerComponent } from "@syncfusion/ej2-react-grids";
import { account } from "~/appwrite/client";
import { useSavedTrips} from "~/appwrite/trips";
import { filterTrips } from '~/appwrite/filterTrips';

const FeaturedDestination = ({ containerClass = '', bigCard = false, rating, title, activityCount, bgImage }: any) => (
  <section className={cn('rounded-[14px] overflow-hidden bg-cover bg-center size-full min-w-[280px]', containerClass, bgImage)}>
    <div className="bg-linear200 h-full">
      <article className="featured-card">
        <div className={cn('bg-white rounded-20 font-bold text-red-100 w-fit py-px px-3 text-sm')}>
          {rating}
        </div>

        <article className="flex flex-col gap-3.5">
          <h2 className={cn('text-lg font-semibold text-white', { 'p-30-bold': bigCard })}>{title}</h2>

          <figure className="flex gap-2 items-center">
            <img
              src="/assets/images/david.webp"
              alt="user"
              className={cn('size-4 rounded-full aspect-square', { 'size-11': bigCard })}
            />
            <p className={cn('text-xs font-normal text-white', { 'text-lg': bigCard })}>{activityCount} activities</p>
          </figure>
        </article>
      </article>
    </div>
  </section>
)

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const limit = 8;
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || "1", 10);
  const offset = (page - 1) * limit;

  const [user, { allTrips, total }] = await Promise.all([
    getUser(),
    getAllTrips(limit, offset),
  ])

  return {
    trips: allTrips.map(({ $id, tripDetail, imageUrls }) => ({
      id: $id,
      ...parseTripData(tripDetail),
      imageUrls: imageUrls ?? []
    })),
    total
  }
}

const TravelPage = ({ loaderData }: Route.ComponentProps) => {
  // loaderData should include trips (same pattern as your other pages)
  const initialTrips = loaderData.trips as Trip[] | [];

  const [trips] = useState<Trip[]>(initialTrips);
  
  // useSavedTrips hook provides savedTrips state and helpers 
  const {
    userId: _userId,
    savedMap,
    savedTrips,
    savingMap,
    toggleSave,
    savedContainerRef,
    showLeftArrow,
    showRightArrow,
    scrollNext,
    scrollPrev,
  } = useSavedTrips();

  useEffect(() => {
    // keep account to ensure SSR/CSR consistency if you had logic that depended on it
    // (left intentionally minimal — useSavedTrips handles account.get)
  }, []);

  const [searchParams] = useSearchParams();
  const initialPage = Number(searchParams.get('page') || '1')

  const [currentPage, setCurrentPage] = useState(initialPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.location.search = `?page=${page}`
  }

  // Shared search to filter both saved and explore lists
  const [searchQuery, setSearchQuery] = useState<string>("");
  const filteredSaved = useMemo(() => filterTrips(savedTrips, searchQuery), [savedTrips, searchQuery]);
  const filteredExplore = useMemo(() => filterTrips(trips, searchQuery), [trips, searchQuery]);
  

  return (
    <main className="flex flex-col">
      <section className="travel-hero">
        <div>
          <section className="wrapper">
            <article>
              <h1 className="p-72-bold text-dark-100">
                Plan Your Trip with Ease
              </h1>

              <p className="text-dark-100">
                Customize your travel itinerary in minutes—pick your destination, set your preferences, and explore with confidence.
              </p>
            </article>

            <Link to="#trips">
              <ButtonComponent type="button" className="button-class !h-11 !w-full md:!w-[240px]">
                <span className="p-16-semibold text-white">
                  Get Started
                </span>
              </ButtonComponent>
            </Link>
          </section>
        </div>
      </section>

      <section className="pt-20 wrapper flex flex-col gap-10 h-full">
        <Header title="Featured Travel Destinations" description="Check out some of the best places you visit around the world" />
        

        <div className="featured">
          <article>
            <FeaturedDestination
              bgImage="bg-card-1"
              containerClass="h-1/3 lg:h-1/2"
              bigCard
              title="Barcelona Tour"
              rating={4.2}
              activityCount={196}
            />

            <div className="travel-featured">
              <FeaturedDestination
                bgImage="bg-card-2"
                bigCard
                title="London"
                rating={4.5}
                activityCount={512}
              />
              <FeaturedDestination
                bgImage="bg-card-3"
                bigCard
                title="Australia Tour"
                rating={3.5}
                activityCount={250}
              />
            </div>
          </article>

          <div className="flex flex-col gap-[30px]">
            <FeaturedDestination
              containerClass="w-full h-[240px]"
              bgImage="bg-card-4"
              title="Spain Tour"
              rating={3.8}
              activityCount={150}
            />
            <FeaturedDestination
              containerClass="w-full h-[240px]"
              bgImage="bg-card-5"
              title="Japan"
              rating={5}
              activityCount={150}
            />
            <FeaturedDestination
              containerClass="w-full h-[240px]"
              bgImage="bg-card-6"
              title="Italy Tour"
              rating={4.2}
              activityCount={500}
            />
          </div>
        </div>
      </section>

      <div className="mt-30 w-full max-w-4xl mx-auto">
          <SearchBar value={searchQuery} onChange={(v) => setSearchQuery(v)} placeholder="Search saved and explore trips..." />
        </div>

      {/* Saved trips section rendered as a horizontal carousel (adaptive widths) */}
      {savedTrips.length > 0 && (
        <section className="mb-8 relative wrapper flex flex-col gap-10 mt-10">
          <Header
            title="Your Saved Trips"
            description="Trips you've saved to revisit later"
          />

          {/* carousel container */}
          <div className="saved-carousel-wrapper">
            {/* hidden on small if you prefer; we keep it always visible */}
            <div
              ref={savedContainerRef}
              className="saved-carousel flex overflow-x-auto overflow-y-visible scroll-smooth no-scrollbar py-2 -mx-2 "
              // style note: -mx-2 + px on items make consistent gutters
            >
              {filteredSaved.map((trip) => (
                <div
                  key={trip.id}
                  className="flex-shrink-0 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 px-2"
                >
                  <TripCard
                    id={trip.id}
                    name={trip.name}
                    imageUrl={trip.imageUrls?.[0]}
                    location={trip.itinerary?.[0]?.location ?? ""}
                    tags={[trip.interests ?? "", trip.travelStyle ?? ""]}
                    price={trip.estimatedPrice}
                    // allow unsave directly from saved list
                    onToggleSave={() => toggleSave(trip.id)}
                    isSaved={Boolean(savedMap[trip.id])}
                    saving={Boolean(savingMap[trip.id])}
                  />
                </div>
              ))}
            </div>

            {/* Left / Right arrow buttons */}
            {showLeftArrow && (
              <button
                onClick={scrollPrev}
                aria-label="Scroll left"
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white shadow flex items-center justify-center focus:outline-none"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 6 L9 12 L15 18" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}

            {showRightArrow && (
              <button
                onClick={scrollNext}
                aria-label="Scroll right"
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white shadow flex items-center justify-center focus:outline-none"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 6 L15 12 L9 18" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>
        </section>
      )}
    <section id="trips" className="py-20 wrapper flex flex-col gap-10" style={{ paddingTop: "50px" }}>
        <Header title="Explore Trips" description="Browse and save trips you like" />

        <div className="trip-grid">
          {filteredExplore.map((trip) => (
            <TripCard
              key={trip.id}
              id={trip.id}
              name={trip.name}
              imageUrl={trip.imageUrls?.[0]}
              location={trip.itinerary?.[0]?.location ?? ""}
              tags={[trip.interests ?? "", trip.travelStyle ?? ""]}
              price={trip.estimatedPrice}
              // pass save toggling only for user-facing pages (admin pages won't pass this)
              onToggleSave={() => toggleSave(trip.id)}
              isSaved={Boolean(savedMap[trip.id])}
              saving={Boolean(savingMap[trip.id])}
            />
          ))}
        </div>

        <PagerComponent
          totalRecordsCount={loaderData.total}
          pageSize={8}
          currentPage={currentPage}
          click={(args) => handlePageChange(args.currentPage)}
          cssClass="!mb-4"
        />
      </section>

      <footer className="h-28 bg-white">
        <div className="wrapper footer-container">
          <Link to="/">
            <img
              src="/assets/icons/logo.svg"
              alt="logo"
              className="size-[30px]"
            />
            <h1>Tourvisto</h1>
          </Link>

          <div>
            {['Terms & Conditions', "Privacy Policy"].map((item) => (
              <Link to="/" key={item}>{item}</Link>
            ))}
          </div>
        </div>
      </footer>
    </main>
  )
}
export default TravelPage
