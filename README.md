# everybite-app-admin

Admin panel for configuring EveryBite's SmartMenu widgets.

<!-- Test: Branch protection verification - CI should pass -->

This repository includes a React (Vite) frontend, AWS Lambda functions for API proxying, and infrastructure for GraphQL code-generation, testing, CI, and deployment.

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

## API Integration

The application uses AWS Lambda functions to proxy API calls to external services (like Metabase). The Lambda functions are deployed separately and referenced via environment variables.

- **Metabase Integration**: Uses Lambda function at `https://ldfubm7l7k2hj4ln3pxtqylcwe0isjau.lambda-url.us-west-1.on.aws/`
- **Environment Variable**: `VITE_METABASE_API_URL` should point to the Lambda function URL

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

For development instructions and roadmap see `docs/`.
