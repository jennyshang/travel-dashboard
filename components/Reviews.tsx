// components/reviews.tsx
import React, { useEffect, useState } from "react";
import { database, ID, Query, account, appwriteConfig } from "~/appwrite/client";
import { Permission, Role } from "appwrite";


interface Review {
    $id: string;
    tripId: string;
    userId: string;
    userName?: string;
    userAvatar?: string;
    text: string;
    rating?: number;
    upvotes?: number;
    $createdAt: string;
}

export default function ReviewsWidgetAppwrite({ tripId }: { tripId: string }) {
    // read env and fall back to client config if present
    const DB = (import.meta.env.VITE_APPWRITE_DATABASE_ID as string) || appwriteConfig?.databaseId;
    const REVIEWS = (import.meta.env.VITE_APPWRITE_COLLECTION_REVIEWS as string) || appwriteConfig?.reviewsCollectionId;

    // sanity checks early — prevents calling Appwrite with empty IDs
    useEffect(() => {
        if (!DB) console.error("ReviewsWidgetAppwrite: VITE_APPWRITE_DATABASE_ID is not set. Please add VITE_APPWRITE_DATABASE_ID to your .env");
        if (!REVIEWS) console.error("ReviewsWidgetAppwrite: VITE_APPWRITE_COLLECTION_REVIEWS is not set. Please add VITE_APPWRITE_COLLECTION_REVIEWS to your .env");
    }, []);

    const [reviews, setReviews] = useState<Review[]>([]);
    const [newText, setNewText] = useState("");
    const [newRating, setNewRating] = useState<number | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        let mounted = true;
        // don't try to call Appwrite if required config is missing
        if (!DB || !REVIEWS) return;

        // load current user
        account.get()
            .then(user => mounted && setCurrentUserId(user.$id))
            .catch(() => { /* not logged in */ });

        // fetch reviews for trip
        async function load() {
            try {
                const res = await database.listDocuments(DB, REVIEWS, [
                    Query.equal("tripId", tripId),
                    Query.orderDesc("$createdAt")
                ]);
                if (!mounted) return;
                setReviews(res.documents as unknown as Review[]);
            } catch (err) {
                console.error("Failed to load reviews", err);
            }
        }
        load();

        return () => { mounted = false; }
    }, [tripId, DB, REVIEWS]);

    const formatTimestamp = (iso: string) => {
        try {
            const d = new Date(iso);
            return d.toLocaleString();
        } catch {
            return iso;
        }
    };

    const handleAddReview = async () => {
        if (!newText.trim() || !currentUserId || submitting) return;
        if (!DB || !REVIEWS) {
            console.error("Cannot add review: DB or REVIEWS collection id is missing.");
            return;
        }
        setSubmitting(true);
        try {
            const user = await account.get();
            const docData = {
                tripId,
                text: newText.trim(),
                userId: currentUserId,
                userName: (user.name || user.email || "Anonymous"),
                userAvatar: (user.prefs?.avatar ?? null),
                rating: newRating ?? null,
            };

            const created = await database.createDocument(
                DB,
                REVIEWS,
                ID.unique(),
                docData,
                [
                    Permission.read(Role.any()),                // public readable
                    Permission.write(Role.user(currentUserId)), // allow the author to write/update/delete
                    Permission.update(Role.user(currentUserId)),
                    Permission.delete(Role.user(currentUserId)),
                ]
            );


            setReviews(prev => [created as unknown as Review, ...prev]);
            setNewText("");
            setNewRating(null);
        } catch (err) {
            console.error("Failed to add review", err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (reviewId: string) => {
        const review = reviews.find(r => r.$id === reviewId);
        if (!review || review.userId !== currentUserId) return;
        if (!DB || !REVIEWS) return;
        const before = reviews;
        setReviews(prev => prev.filter(r => r.$id !== reviewId));
        try {
            await database.deleteDocument(DB, REVIEWS, reviewId);
        } catch (err) {
            console.error("Failed to delete review", err);
            setReviews(before);
        }
    };

    // ... rest of the UI (same as previous snippet) ...
    return (
        <div className="absolute bottom-2 right-2 flex items-center gap-2">
            <div className="bg-white rounded-full shadow px-3 py-1">
                <details className="relative">
                    <summary className="cursor-pointer text-sm text-blue-600">💬 {reviews.length}</summary>
                    <div className="absolute bottom-full right-0 w-80 bg-white shadow-lg p-3 rounded-lg z-50">
                        {/* reviews list + add form (same as earlier implementation) */}
                        {/* copy the UI portion from your last working copy or the snippet I provided previously */}
                        <div className="max-h-60 overflow-y-auto mb-2 space-y-2">
                            {reviews.length === 0 && <p className="text-xs text-gray-500">No reviews yet — be the first!</p>}
                            {reviews.map(r => (
                                <div key={r.$id} className="text-xs border-b pb-1">
                                    <div className="flex items-center gap-2">
                                        {r.userAvatar ? (
                                            <img src={r.userAvatar} alt={r.userName} className="w-6 h-6 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px]">{r.userName?.[0] ?? "?"}</div>
                                        )}
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <div className="font-medium text-[12px]">{r.userName ?? "Anonymous"}</div>
                                                <div className="text-[11px] text-gray-400">{formatTimestamp(r.$createdAt)}</div>
                                            </div>
                                            <div className="text-[12px]">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <svg key={i} className="w-4 h-4 inline-block" viewBox="0 0 24 24" fill={Boolean(r.rating && i < r.rating) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                                                        <path d="M12 17.3L6.2 20l1-6.1L2.5 9.6l6.2-.9L12 3l3.3 5.7 6.2.9-4.7 4.3 1 6.1z" />
                                                    </svg>
                                                ))}
                                            </div>
                                            <p className="text-[13px] mt-1">{r.text}</p>
                                        </div>
                                    </div>
                                    {currentUserId === r.userId && (
                                        <div className="mt-1 text-right">
                                            <button onClick={() => handleDelete(r.$id)} className="text-[11px] text-red-500 hover:underline">Delete</button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* add new review form */}
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1">
                                <div className="text-[12px]">Your rating:</div>
                                <div>
                                    {Array.from({ length: 5 }).map((_, idx) => {
                                        const v = idx + 1;
                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => setNewRating(v)}
                                                className="p-0.5"
                                                aria-label={`Rate ${v} star`}
                                                type="button"
                                            >
                                                <svg className="w-4 h-4 inline-block" viewBox="0 0 24 24" fill={newRating && idx < newRating ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                                                    <path d="M12 17.3L6.2 20l1-6.1L2.5 9.6l6.2-.9L12 3l3.3 5.7 6.2.9-4.7 4.3 1 6.1z" />
                                                </svg>
                                            </button>
                                        );
                                    })}
                                    <button onClick={() => setNewRating(null)} className="text-[11px] ml-2">clear</button>
                                </div>
                            </div>

                            <textarea
                                value={newText}
                                onChange={(e) => setNewText(e.target.value)}
                                placeholder="Add a review..."
                                className="border rounded p-1 text-xs w-full"
                                rows={3}
                            />

                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => { setNewText(""); setNewRating(null); }}
                                    className="text-xs px-2 py-1 bg-gray-100 rounded"
                                    type="button"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddReview}
                                    disabled={!currentUserId || submitting || !newText.trim()}
                                    className="text-xs px-2 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
                                >
                                    {submitting ? "…" : "Send"}
                                </button>
                            </div>
                        </div>

                    </div>
                </details>
            </div>
        </div>
    );
}
