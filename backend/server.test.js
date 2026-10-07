import { test } from "node:test";
import assert from "node:assert/strict";
import app from "./server.js";

// Start the app on an ephemeral port for each test run.
function listen() {
  return new Promise((resolve) => {
    const server = app.listen(0, () => resolve(server));
  });
}

test("GET /healthz returns ok", async () => {
  const server = await listen();
  const { port } = server.address();
  try {
    const res = await fetch(`http://127.0.0.1:${port}/healthz`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, "ok");
  } finally {
    server.close();
  }
});

test("GET /api/messages returns a list", async () => {
  const server = await listen();
  const { port } = server.address();
  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/messages`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body.messages));
    assert.ok(body.messages.length >= 1);
  } finally {
    server.close();
  }
});
