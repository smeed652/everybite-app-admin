import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: [
    {
      'https://api.everybite.com/graphql': {
        headers: {
          Authorization: process.env.EVERYBITE_API_KEY || '',
        },
      },
    },
  ],
  documents: ['client/src/**/*.{ts,tsx}'],
  generates: {
    'client/src/generated/': {
      preset: 'client',
      plugins: [],
      presetConfig: {
        /* React Apollo hooks + typed documents */
        gqlTagName: 'gql',
      },
    },
  },
  ignoreNoDocuments: true, // allows codegen to run even if no operations yet
};

export default config;
