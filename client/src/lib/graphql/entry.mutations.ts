import { gql } from '@apollo/client';

export const LIKE_ENTRY = gql`
  mutation LikeEntry($entryId: Int!) {
    likeEntry(entryId: $entryId) {
      id
      likes
      likedBy {
        userId
        userName
      }
    }
  }
`;

export const UNLIKE_ENTRY = gql`
  mutation UnlikeEntry($entryId: Int!) {
    unlikeEntry(entryId: $entryId) {
      id
      likes
      likedBy {
        userId
        userName
      }
    }
  }
`;

export const COMMENT_ENTRY = gql`
  mutation CommentEntry($entryId: Int!, $content: String!) {
    commentEntry(entryId: $entryId, content: $content) {
      id
      comments {
        id
        content
        userId
        userName
        userPhoto
        createdAt
        likes
        likedBy {
          userId
          userName
        }
      }
    }
  }
`;

export const LIKE_COMMENT = gql`
  mutation LikeComment($entryId: Int!, $commentId: Int!) {
    likeComment(entryId: $entryId, commentId: $commentId) {
      id
      comments {
        id
        likes
        likedBy {
          userId
          userName
        }
      }
    }
  }
`;

export const UNLIKE_COMMENT = gql`
  mutation UnlikeComment($entryId: Int!, $commentId: Int!) {
    unlikeComment(entryId: $entryId, commentId: $commentId) {
      id
      comments {
        id
        likes
        likedBy {
          userId
          userName
        }
      }
    }
  }
`;
