import { QueryClient } from 'react-query';

/**
 * Creates a QueryClient instance for managing query and mutation configurations.
 * 
 * @type {QueryClient}
 */
const QueryClients = new QueryClient({
  defaultOptions: {
    queries: {
      /**
       * Number of retry attempts for failed queries.
       * @type {number}
       */
      retry: 2, // Number of retries for failed queries
      /**
       * Whether to refetch the query when the window gains focus.
       * @type {boolean}
       */
      refetchOnWindowFocus: true, // Refetch on window focus
      /**
       * Time in milliseconds that a query's data is considered fresh.
       * 
       * @type {number}
       */
      staleTime: 5 * 60 * 1000, // 5 minutes
      /**
       * Time in milliseconds that a query's data remains in cache after the last observer unsubscribes.
       * @type {number}
       */
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
    mutations: {
      /**
       * Number of retry attempts for failed mutations.
       * @type {number}
       */
      retry: 2, // Number of retries for failed mutations
    },
  },
});

export default QueryClients;
