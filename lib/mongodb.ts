import dns from "node:dns";
import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "word_heist";

if (!uri) {
  throw new Error("Missing MONGODB_URI environment variable");
}

// Some Windows dev machines fail Node's own SRV DNS lookups against Atlas
// ("querySrv ECONNREFUSED") even though the OS resolver works fine. Dev-only —
// Vercel's Linux runtime never hits this, so production is unaffected.
if (process.env.NODE_ENV === "development") {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
}

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // Reuse the client across HMR reloads in dev so we don't exhaust connections.
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = new MongoClient(uri).connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  clientPromise = new MongoClient(uri).connect();
}

export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db(dbName);
}

export default clientPromise;
