import { Account, Client, Databases, Storage, ID, Query } from 'appwrite';

export const appwriteConfig = {
    endpointUrl: import.meta.env.VITE_APPWRITE_API_ENDPOINT,
    projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID,
    apiKey: import.meta.env.VITE_APPWRITE_API_KEY,
    databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
    userCollectionId: import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID,
    tripCollectionId: import.meta.env.VITE_APPWRITE_TRIPS_COLLECTION_ID,
    savedCollectionId: import.meta.env.VITE_APPWRITE_SAVED_COLLECTION_ID,
    reviewsCollectionId: import.meta.env.VITE_APPWRITE_COLLECTION_REVIEWS,
    upvotesCollectionId: import.meta.env.VITE_APPWRITE_COLLECTION_UPVOTES
}

const client = new Client()
    .setEndpoint(appwriteConfig.endpointUrl)
    .setProject(appwriteConfig.projectId)

const account = new Account(client);
const database = new Databases(client);
const storage = new Storage(client);

export { client, account, database, storage, ID, Query };