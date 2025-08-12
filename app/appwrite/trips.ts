import { Query } from "appwrite"
import { appwriteConfig, database } from "./client"
import { useEffect, useRef, useState, useLayoutEffect } from "react";
import { account } from "~/appwrite/client";
import { getSavedTripsByUser, saveTripForUser, unsaveById } from "~/appwrite/savedTrips";
import { parseTripData } from "~/lib/utils";

// Logic for fetching all the trips 
export const getAllTrips = async (limit: number, offset: number) => {
    const allTrips = await database.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.tripCollectionId,
        [Query.limit(limit), Query.offset(offset), Query.orderDesc('createdAt')]
    )

    if (allTrips.total === 0) {
        console.error('No trips found');
        return { allTrips: [], total: 0 }
    }

    return {
        allTrips: allTrips.documents,
        total: allTrips.total,
    }
}

// Fetch a trip by id
export const getTripById = async (tripId: string) => {
    const trip = await database.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.tripCollectionId,
        tripId
    );

    if (!trip.$id) {
        console.log('Trip not found')
        return null;
    }

    return trip;
}

/**
 * Delete a trip document by id
 * Uses the same `database` client you've used above.
 */
export const deleteTrip = async (tripId: string) => {
  try {
    return await database.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.tripCollectionId,
      tripId
    );
  } catch (err) {
    console.error("deleteTrip error:", err);
    throw err;
  }
}

/**
 * Hook that encapsulates saved-trips loading, toggle logic and carousel controls.
 * Returns the same variables that travel-page.tsx expects.
 */
export function useSavedTrips() {
  const [userId, setUserId] = useState<string | null>(null);
  const [savedMap, setSavedMap] = useState<Record<string, string>>({});
  const [savedTrips, setSavedTrips] = useState<Trip[]>([]);
  const [savingMap, setSavingMap] = useState<Record<string, boolean>>({});

  const savedContainerRef = useRef<HTMLDivElement | null>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  // update arrow visibility helper
  const updateArrowVisibility = () => {
    const el = savedContainerRef.current;
    if (!el) return;
    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    setShowLeftArrow(el.scrollLeft > 10);
    setShowRightArrow(el.scrollLeft < maxScrollLeft - 10);
  };

  const scrollNext = () => {
    const el = savedContainerRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.95;
    el.scrollBy({ left: amount, behavior: "smooth" });
  };
  const scrollPrev = () => {
    const el = savedContainerRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.95;
    el.scrollBy({ left: -amount, behavior: "smooth" });
  };

  // keep arrow visibility in sync with content/resize/scroll
  useLayoutEffect(() => {
    const el = savedContainerRef.current;
    if (!el) return;
    updateArrowVisibility();
    const onScroll = () => updateArrowVisibility();
    const onResize = () => updateArrowVisibility();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
    // re-run when savedTrips changes (content width may change)
  }, [savedTrips]);

  // load user saved docs and fetch saved trip details
  useEffect(() => {
    let mounted = true;
    const loadUserAndSaved = async () => {
      try {
        const acc = await account.get();
        if (!mounted) return;
        setUserId(acc.$id);

        const savedRes = await getSavedTripsByUser(acc.$id);
        if (!mounted) return;

        const map: Record<string, string> = {};
        (savedRes.documents ?? []).forEach((d: any) => {
          if (d.tripId && d.$id) map[d.tripId] = d.$id;
        });
        setSavedMap(map);

        // fetch trip details
        const tripIds = Object.keys(map);
        if (tripIds.length > 0) {
          try {
            const tripFetches = await Promise.all(
              tripIds.map(async (tId) => {
                try {
                  const doc = await getTripById(tId);
                  if (!doc) return null;
                  return {
                    id: doc.$id,
                    ...parseTripData(doc.tripDetail),
                    imageUrls: doc.imageUrls ?? [],
                  } as Trip;
                } catch (e) {
                  console.error("failed to fetch saved trip", tId, e);
                  return null;
                }
              })
            );
            const valid = tripFetches.filter(Boolean) as Trip[];
            if (mounted) setSavedTrips(valid);
          } catch (err) {
            console.error("Error loading saved trip details", err);
          }
        } else {
          if (mounted) setSavedTrips([]);
        }
      } catch (err) {
        if (mounted) {
          setUserId(null);
          setSavedMap({});
          setSavedTrips([]);
        }
      }
    };
    loadUserAndSaved();
    return () => {
      mounted = false;
    };
  }, []);

  // toggle save/unsave
  const toggleSave = async (tripId: string) => {
    let currentUserId: string | null = null;
    try {
      const acc = await account.get();
      currentUserId = acc.$id;
    } catch (err) {
      alert("Please log in to save trips.");
      return;
    }

    if (savingMap[tripId]) return;
    const savedDocId = savedMap[tripId];
    try {
      setSavingMap((m) => ({ ...m, [tripId]: true }));
      if (savedDocId) {
        await unsaveById(savedDocId);
        setSavedMap((m) => {
          const copy = { ...m };
          delete copy[tripId];
          return copy;
        });
        setSavedTrips((prev) => prev.filter((t) => t.id !== tripId));
      } else {
        const doc = await saveTripForUser(currentUserId!, tripId);
        setSavedMap((m) => ({ ...m, [tripId]: doc.$id }));
        try {
          const tripDoc = await getTripById(tripId);
          if (tripDoc) {
            const t: Trip = {
              id: tripDoc.$id,
              ...parseTripData(tripDoc.tripDetail),
              imageUrls: tripDoc.imageUrls ?? [],
            };
            setSavedTrips((prev) => [t, ...prev]);
          }
        } catch (e) {
          console.error("Failed to fetch trip after save", e);
        }
      }
    } catch (err: any) {
      console.error("toggleSave error", err);
      const msg = err?.message || err?.$message || JSON.stringify(err) || "Failed to update saved trips. Please try again.";
      alert(`Couldn't update saved trips: ${msg}`);
    } finally {
      setSavingMap((m) => ({ ...m, [tripId]: false }));
    }
  };

  return {
    userId,
    savedMap,
    savedTrips,
    savingMap,
    toggleSave,
    savedContainerRef,
    showLeftArrow,
    showRightArrow,
    scrollNext,
    scrollPrev,
  };
}