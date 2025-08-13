import { useSearchParams, type LoaderFunctionArgs } from "react-router";
import { Header, SearchBar, TripCard } from "../../../components";
import { getAllTrips, deleteTrip } from "~/appwrite/trips";
import { parseTripData } from "~/lib/utils";
import type { Route } from "./+types/trips";
import { useMemo, useState } from "react";
import { PagerComponent } from "@syncfusion/ej2-react-grids";
import { filterTrips } from "~/appwrite/filterTrips";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const limit = 8;
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || "1", 10);
  const offset = (page - 1) * limit;

  const { allTrips, total } = await getAllTrips(limit, offset)

  return {
    trips: allTrips.map(({ $id, tripDetail, imageUrls }) => ({
      id: $id,
      ...parseTripData(tripDetail),
      imageUrls: imageUrls ?? []
    })),
    total
  }
}



const Trips = ({ loaderData }: Route.ComponentProps) => {
  const initialTrips = loaderData.trips as Trip[] | [];
  const [trips, setTrips] = useState<Trip[]>(initialTrips);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const filtered = useMemo(() => filterTrips(trips, searchQuery), [trips, searchQuery]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [searchParams] = useSearchParams();
  const initialPage = Number(searchParams.get('page') || '1')
  const [currentPage, setCurrentPage] = useState(initialPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.location.search = `?page=${page}`
  }

  const handleDelete = async (id: string) => {
    const ok = window.confirm("Delete this trip? This action cannot be undone.");
    if (!ok) return;

    try {
      setDeletingId(id);
      await deleteTrip(id);
      setTrips(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error("Failed to delete trip", err);
      // replace with your toast if you have one
      alert("Failed to delete trip. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="all-users wrapper">
      <Header
        title="Trips"
        description="View and edit AI-generated travel plans."
        ctaText="Create a trip"
        ctaUrl='/trips/create'
      />

      <section>
        <h1 className="p-24-semibold text-dark-100 mb-4">
          Manage Created Trips
        </h1>


        <div className="mb-6 w-80 mt-4">
          <SearchBar value={searchQuery} onChange={(v) => setSearchQuery(v)} placeholder="Search trips to manage..." />
        </div>

        <div className="trip-grid mb-4">
          {filtered.map((trip) => (
            <TripCard
              key={trip.id}
              id={trip.id}
              name={trip.name}
              imageUrl={trip.imageUrls?.[0]}
              location={trip.itinerary?.[0]?.location ?? ""}
              tags={[trip.interests ?? "", trip.travelStyle ?? ""]}
              price={trip.estimatedPrice}
              onDelete={() => handleDelete(trip.id)}
              deleting={deletingId === trip.id}
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
    </main>
  )
}

export default Trips
