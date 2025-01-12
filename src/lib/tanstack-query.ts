import {
  QueryCache,
  MutationCache,
  QueryClient,
  isServer,
  defaultShouldDehydrateQuery,
} from "@tanstack/react-query";
import { type DefaultOptions } from "@tanstack/react-query";

export const defaultOptions: DefaultOptions = {
  mutations: {},
  queries: {
    refetchInterval: false,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  },
};

const errorHandler = (err: Error) => {
  alert("An error occurred: " + err.message);
  console.error(err);
};

function makeQueryClient() {
  const queryCache = new QueryCache({
    onError: errorHandler,
  });

  const mutationCache = new MutationCache({
    onError: errorHandler,
  });

  return new QueryClient({
    defaultOptions: {
      queries: {
        ...defaultOptions.queries,
      },
      dehydrate: {
        // include pending queries in dehydration
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
    },
    queryCache,
    mutationCache,
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (isServer) {
    return makeQueryClient();
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}
