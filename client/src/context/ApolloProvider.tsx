'use client';

import { ApolloProvider as Provider } from '@apollo/client/react';
import { apolloClient } from '@/lib/graphql/apollo-client';
import React from 'react';

export function ApolloProvider({ children }: { children: React.ReactNode }) {
  return <Provider client={apolloClient}>{children}</Provider>;
}
