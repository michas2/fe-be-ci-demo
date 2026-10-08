# Frontend ↔ Backend CI Demo

Example repository showing how to test the interaction between a **frontend**
and a **backend** on GitHub Actions, using a **two-tier pipeline**:

1. **Fast tier — Docker Compose:** builds both images and brings the stack up
   with `docker compose`, then runs an integration test. Quick feedback on
   "do the two services work together at all?"
2. **Fidelity tier — vind + Helm:** spins up a real single-node Kubernetes
   cluster with [vind](https://github.com/loft-sh/vind) (vCluster in Docker),
   deploys the **Helm chart**, and runs the *same* integration test through the
   **Gateway** (Kubernetes Gateway API, served by
   [Envoy Gateway](https://gateway.envoyproxy.io/)). Because vind provides a
   working LoadBalancer, the test hits the Gateway's real LoadBalancer address
   directly — no `kubectl port-forward`. Catches Kubernetes-specific issues
   (Service DNS, probes, Gateway routing, LoadBalancer) before any real
   infrastructure is involved.

Both tiers run the **same container images** and the **same integration test** —
only the way the services are wired together differs. Docker Compose and
Kubernetes/Helm do not interoperate; they are two independent environments that
happen to run the same images.

## Layout

```
backend/        Node/Express API (/healthz, /api/messages, /api/info)
frontend/       nginx serving a static page; proxies /api -> backend
chart/          Helm chart (Deployments, Services, Gateway + HTTPRoute) for the fidelity tier
tests/          Portable integration test (reads BASE_URL)
docker-compose.yml   Fast tier + local dev
.github/workflows/ci.yml   The two-tier pipeline
```

## How the frontend finds the backend

The frontend (nginx) reverse-proxies `/api/*` to the backend, so the browser
stays same-origin. The upstream is configurable via environment variables, which
is what makes the same image portable across both tiers:

| Environment | `BACKEND_HOST`        | Set by           |
| ----------- | --------------------- | ---------------- |
| Compose     | `backend`             | compose service |
| Kubernetes  | `demo-backend`        | Helm chart       |

## Run locally

Docker Compose (fast tier):

```bash
docker compose up --build
# frontend on http://localhost:18080  (proxies /api to the backend)
BASE_URL=http://localhost:18080 node --test tests/integration.test.mjs
docker compose down
```

Backend unit tests:

```bash
cd backend && npm ci && npm test
```

Render the Helm chart:

```bash
helm template demo ./chart
```

## The pipeline (`.github/workflows/ci.yml`)

| Job                  | What it does                                                        |
| -------------------- | ------------------------------------------------------------------- |
| `unit`               | Backend unit tests (`npm test`).                                    |
| `compose-fast-tier`  | `docker compose up` + integration test against `:18080`.            |
| `fidelity-tier`      | vind cluster + Envoy Gateway (Gateway API) + `helm install` + integration test through the Gateway LoadBalancer. |

Both integration jobs depend on `unit`. Everything runs on the free
`ubuntu-latest` GitHub-hosted runner — no self-hosted runner required.

## What each tier catches

- **Compose:** image build errors, basic service-to-service wiring, the API
  contract between frontend and backend.
- **vind + Helm:** everything above *plus* Kubernetes Service discovery,
  readiness/liveness probes, LoadBalancer provisioning, and Gateway API routing
  — i.e. the actual deployment path.
