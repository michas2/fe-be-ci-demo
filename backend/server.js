import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

// Simple in-memory data so the frontend has something real to render.
const messages = [
  { id: 1, text: "Hello from the backend" },
  { id: 2, text: "Frontend and backend are talking" },
];

// Liveness/readiness probe target.
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

// Only listen when run directly, so tests can import the app.
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`backend listening on :${PORT}`);
  });
}

export default app;
