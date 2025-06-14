# everybite-app-admin

Admin panel for configuring EveryBite’s SmartMenu widgets.

This repository includes a React (Vite) frontend, Node/Express backend, and infrastructure for GraphQL code-generation, testing, CI, and deployment.

---

## Docker

### Development

```bash
# start dev container with hot-reload on http://localhost:5173
docker compose up app
```

### Production preview

```bash
# build and serve static bundle on http://localhost:8080
docker compose up prod
```

Images are pinned to stable versions (`node:18-alpine`, `nginx:stable-alpine`).

For development instructions and roadmap see `docs/`.
