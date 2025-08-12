// ~/appwrite/savedTrips.ts
import { Query, ID, Permission, Role } from "appwrite";
import { appwriteConfig, database, account } from "./client";

/**
 * Create a saved-trip doc linking a user -> trip
 * Sets owner-only permissions so only the user can read/write/delete their saved doc.
 */
export async function saveTripForUser(userId: string, tripId: string) {
  try {
    if (!appwriteConfig.savedCollectionId) {
      throw new Error("savedCollectionId missing from appwriteConfig");
    }

    const permissions = [
      Permission.read(Role.user(userId)),
      Permission.write(Role.user(userId)),
      Permission.delete(Role.user(userId)),
    ];

    console.debug("[savedTrips] creating saved doc for", { userId, tripId });
    const doc = await database.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savedCollectionId,
      ID.unique(),
      { userId, tripId },
      permissions
    );
    console.debug("[savedTrips] created", doc);
    return doc;
  } catch (err) {
    console.error("[savedTrips] saveTripForUser error:", err);
    // rethrow so callers can inspect error.message / error.code
    throw err;
  }
}

/**
 * Delete a saved-trip doc by its document id
 */
export async function unsaveById(savedDocId: string) {
  try {
    if (!appwriteConfig.savedCollectionId) {
      throw new Error("savedCollectionId missing from appwriteConfig");
    }
    console.debug("[savedTrips] deleting savedDocId", savedDocId);
    const res = await database.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savedCollectionId,
      savedDocId
    );
    console.debug("[savedTrips] deleted", savedDocId, res);
    return res;
  } catch (err) {
    console.error("[savedTrips] unsaveById error:", err);
    throw err;
  }
}

/**
 * List saved docs for a given user
 */
export async function getSavedTripsByUser(userId: string, limit = 500, offset = 0) {
  try {
    if (!appwriteConfig.savedCollectionId) {
      throw new Error("savedCollectionId missing from appwriteConfig");
    }

    const res = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.savedCollectionId,
      [Query.equal("userId", userId), Query.limit(limit), Query.offset(offset)]
    );
    console.debug("[savedTrips] found saved docs", res.total);
    return {
      documents: res.documents,
      total: res.total,
    };
  } catch (err) {
    console.error("[savedTrips] getSavedTripsByUser error:", err);
    throw err;
  }
}

/**
 * Optional helper: find saved doc for (user, trip) pair
 */
export async function getSavedByUserAndTrip(userId: string, tripId: string) {
  try {
    if (!appwriteConfig.savedCollectionId) {
      throw new Error("savedCollectionId missing from appwriteConfig");
    }
    const res = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.savedCollectionId,
      [Query.equal("userId", userId), Query.equal("tripId", tripId), Query.limit(1)]
    );
    return res.documents[0] ?? null;
  } catch (err) {
    console.error("[savedTrips] getSavedByUserAndTrip error:", err);
    throw err;
  }
}
