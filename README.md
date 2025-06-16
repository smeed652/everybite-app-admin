# everybite-app-admin

Admin panel for configuring EveryBite’s SmartMenu widgets.

This repository includes a React (Vite) frontend, Node/Express backend, and infrastructure for GraphQL code-generation, testing, CI, and deployment.

---

## Local Setup

1. Copy `.env.example` to `.env.local` and fill in values.
2. Configure AWS credentials locally:
   ```bash
   mkdir -p ~/.aws
   # edit ~/.aws/credentials
   [everybite-admin]
   aws_access_key_id = <YOUR_ACCESS_KEY_ID>
   aws_secret_access_key = <YOUR_SECRET_ACCESS_KEY>
   region = us-west-1
   ```
   Then load the profile when running local dev:
   ```bash
   export AWS_SDK_LOAD_CONFIG=1
   export AWS_PROFILE=everybite-admin
   vercel dev
   ```

3. **Project linking**: The `.vercel` directory (which stores the Vercel project/org IDs) is committed to the repo. After cloning, running `vercel dev` should start immediately. If you ever see the interactive "Set up and develop..." prompt, make sure you're in the project root and that the `.vercel` folder is present. If it was removed, recreate it with `vercel link`. 

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
