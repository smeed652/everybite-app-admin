import express from 'express';
import cors from 'cors';

const PORT = process.env.PORT || 4000;

const app = express();
app.use(cors());
app.use(express.json());

// Simple health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Placeholder GraphQL proxy endpoint
app.use('/graphql', (req, res) => {
  res.status(501).json({ message: 'GraphQL proxy not yet implemented' });
});

app.listen(PORT, () => {
  /* eslint-disable no-console */
  console.log(`[backend] listening on :${PORT}`);
});
