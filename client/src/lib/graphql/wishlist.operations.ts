import { gql } from '@apollo/client';

export const WISHLIST_QUERY = gql`
  query GetWishlist {
    wishlist {
      id
      coffeeId
      createdAt
      coffee {
        id
        name
        origin
        process
        description
        photoUrl
        roasterId
        roaster {
          id
          name
          location
          logoUrl
        }
      }
    }
  }
`;

export const IS_IN_WISHLIST_QUERY = gql`
  query IsInWishlist($coffeeId: Int!) {
    isInWishlist(coffeeId: $coffeeId)
  }
`;

export const ADD_TO_WISHLIST_MUTATION = gql`
  mutation AddToWishlist($coffeeId: Int!) {
    addToWishlist(coffeeId: $coffeeId) {
      id
      coffeeId
      createdAt
      coffee {
        id
        name
        origin
        process
        description
        photoUrl
        roasterId
        roaster {
          id
          name
          location
          logoUrl
        }
      }
    }
  }
`;

export const REMOVE_FROM_WISHLIST_MUTATION = gql`
  mutation RemoveFromWishlist($coffeeId: Int!) {
    removeFromWishlist(coffeeId: $coffeeId)
  }
`;
