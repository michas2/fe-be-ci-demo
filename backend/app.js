import express from "express";

const app = express();

// Simple in-memory data so the frontend has something real to render.
const messages = [
  { id: 1, text: "Hello from the backend" },
  { id: 2, text: "Frontend and backend are talking" },
];

// Liveness/readiness probe target. For a real service this should also check
// critical dependencies (DB, caches) rather than always returning ok.
app.get("/healthz", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// The API the frontend consumes.
app.get("/api/messages", (_req, res) => {
  res.json({ messages });
});

app.get("/api/info", (_req, res) => {
  res.json({
    service: "example-backend",
    version: process.env.APP_VERSION || "dev",
    time: new Date().toISOString(),
  });
});

export default app;
