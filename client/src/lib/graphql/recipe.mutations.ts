import { gql } from '@apollo/client';

export const CREATE_RECIPE = gql`
  mutation CreateRecipe($input: CreateRecipeInput!) {
    createRecipe(input: $input) {
      id
      title
      description
      brewMethod
      grindSize
      phases {
        name
        waterTemp
        waterAmount
        startTime
        notes
      }
      brewTime
      dose
      waterMl
      notes
      userId
      userName
      userPhoto
      likes
      likedBy {
        userId
        userName
      }
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_RECIPE = gql`
  mutation UpdateRecipe($id: Int!, $input: UpdateRecipeInput!) {
    updateRecipe(id: $id, input: $input) {
      id
      title
      description
      brewMethod
      grindSize
      phases {
        name
        waterTemp
        waterAmount
        startTime
        notes
      }
      brewTime
      dose
      waterMl
      notes
      userId
      userName
      userPhoto
      likes
      likedBy {
        userId
        userName
      }
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_RECIPE = gql`
  mutation DeleteRecipe($id: Int!) {
    deleteRecipe(id: $id)
  }
`;

export const LIKE_RECIPE = gql`
  mutation LikeRecipe($recipeId: Int!) {
    likeRecipe(recipeId: $recipeId) {
      id
      title
      description
      instructions
      phases {
        name
        waterAmount
        waterTemp
      }
      brewTime
      dose
      waterMl
      notes
      userId
      userName
      userPhoto
      likes
      likedBy {
        userId
        userName
      }
      createdAt
      updatedAt
    }
  }
`;

export const UNLIKE_RECIPE = gql`
  mutation UnlikeRecipe($recipeId: Int!) {
    unlikeRecipe(recipeId: $recipeId) {
      id
      title
      description
      instructions
      phases {
        name
        waterAmount
        waterTemp
      }
      brewTime
      dose
      waterMl
      notes
      userId
      userName
      userPhoto
      likes
      likedBy {
        userId
        userName
      }
      createdAt
      updatedAt
    }
  }
`;
