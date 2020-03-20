import gql from 'graphql-tag';

export const DELETE_COMMENT = gql`
  mutation delete($_id: ObjectId!) {
    deleteReportComment(id: $_id) {
      ... on SuccessResponse {
        message
      }
      ... on ErrorResponse {
        message
      }
    }
  }
`;
