// Portable integration test for the whole stack (frontend -> backend).
// Hits the frontend's public URL and asserts the backend is reachable
// *through the frontend proxy*, which is what proves the two tiers talk.
//
// The SAME test runs against both CI tiers:
//   - fast tier (docker compose): BASE_URL=http://localhost:18080
//   - fidelity tier (kind+helm):  BASE_URL=http://localhost:8080 (via ingress)
//
// Run: BASE_URL=... node --test
import { test } from "node:test";
import assert from "node:assert/strict";

const BASE_URL = process.env.BASE_URL || "http://localhost:18080";

async function getJson(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  assert.equal(res.status, 200, `${path} should return 200`);
  return res.json();
}

test("frontend serves the SPA", async () => {
  const res = await fetch(`${BASE_URL}/`);
  assert.equal(res.status, 200);
  const html = await res.text();
  assert.match(html, /Frontend .* Backend Demo/, "index.html should render our demo page");
});

test("frontend health endpoint is up", async () => {
  const res = await fetch(`${BASE_URL}/healthz`);
  assert.equal(res.status, 200);
});

test("frontend proxies /api/messages to the backend", async () => {
  const body = await getJson("/api/messages");
  assert.ok(Array.isArray(body.messages), "messages should be an array");
  assert.ok(body.messages.length >= 1, "there should be at least one message");
  assert.ok(
    body.messages.some((m) => typeof m.text === "string"),
    "messages should have text",
  );
});

test("frontend proxies /api/info to the backend", async () => {
  const body = await getJson("/api/info");
  assert.equal(body.service, "example-backend", "info should come from our backend");
  assert.ok(body.version, "version should be set");
});
