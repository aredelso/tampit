import { gql } from '@apollo/client';

export const ADD_TO_WISHLIST = gql`
  mutation AddToWishlist($coffeeId: Int!) {
    addToWishlist(coffeeId: $coffeeId) {
      id
      coffeeId
      coffee {
        id
        name
        roaster {
          id
          name
          logoUrl
        }
      }
    }
  }
`;

export const REMOVE_FROM_WISHLIST = gql`
  mutation RemoveFromWishlist($coffeeId: Int!) {
    removeFromWishlist(coffeeId: $coffeeId)
  }
`;
