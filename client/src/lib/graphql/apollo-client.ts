import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
} from '@apollo/client';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

const authLink = new ApolloLink((operation, forward) => {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  operation.setContext({
    headers: {
      authorization: token ? `Bearer ${token}` : '',
    },
  });

  return forward(operation);
});

const httpLink = new HttpLink({
  uri: `${API}/graphql`,
  credentials: 'include',
  fetchOptions: {
    credentials: 'include',
  },
});

const link = authLink.concat(httpLink);

export const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});
