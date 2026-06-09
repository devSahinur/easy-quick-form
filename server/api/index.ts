// Vercel serverless entry point for the Express API.
// Vercel runs this as a single Function; `vercel.json` rewrites every request
// here, and Express does the internal routing (/api/v1/auth, /api/v1/forms, ...).
import mongoose from 'mongoose';
import app from '../src/app';

// Cache the connection across warm invocations so we don't open a new pool on
// every request (serverless reuses the container between calls).
let connPromise: Promise<typeof mongoose> | null = null;

function connectDB() {
  if (!connPromise) {
    // If the connection fails, clear the cache so the next request can retry
    // instead of being stuck with a permanently-rejected promise.
    connPromise = mongoose.connect(process.env.DATABASE as string).catch(err => {
      connPromise = null;
      throw err;
    });
  }
  return connPromise;
}

export default async function handler(req: any, res: any) {
  try {
    await connectDB();
  } catch (err) {
    res.statusCode = 500;
    res.end('Database connection failed');
    return;
  }
  // Express app is callable as (req, res) — hand the request off to it.
  return app(req, res);
}
