import { QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,   // 5 min — serve cached data without revalidating
      gcTime: 10 * 60 * 1000,     // 10 min — keep unused data in memory
      retry: 1,
      refetchOnWindowFocus: false, // don't hammer the API on every tab switch
    },
  },
})

export default queryClient
