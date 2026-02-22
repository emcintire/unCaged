import { defineConfig } from 'orval';

export default defineConfig({
  uncaged: {
    input: {
      target: `http://localhost:${process.env.PORT ?? 3000}/api-docs.json`,
    },
    output: {
      target: './apps/client/src/services/generated/api.ts',
      client: 'react-query',
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
