import { defineConfig } from 'orval';

export default defineConfig({
  uncaged: {
    input: {
      target: './apps/server/openapi.json',
    },
    output: {
      client: 'react-query',
      mode: 'split',
      target: './apps/client/src/services/generated/api.ts',
      override: {
        fetch: {
          includeHttpResponseReturnType: false,
        },
        mutator: {
          path: './apps/client/src/services/axiosInstance.ts',
          name: 'axiosInstance',
        },
        query: {
          useQuery: true,
          useMutation: true,
        },
      },
    },
  },
});
