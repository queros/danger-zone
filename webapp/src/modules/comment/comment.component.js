import { useMutation } from '@apollo/react-hooks';
import { Icon, Tooltip } from 'antd';
import moment from 'moment';
import React, { useCallback, useContext, useState } from 'react';
import styled from 'styled-components';
import { CommentContext } from '../../contexts/comment.context';
import { ERROR_RESPONSE } from '../../utils/constants/respons-types.const';
import { openErrorNotification } from '../../utils/notifications';
import { CommentList } from '../commentList/comment-list.component';
import { LikeButtons } from '../likeButtons/like-buttons.component';
import { DELETE_COMMENT } from './comment.mutations';

const HeaderSection = styled.div`
  display: flex;
  font-size: 0.85em;
  color: #545557;
`;

const MessageSection = styled.div`
  word-wrap: break-word;
  padding: 8px;
`;

const DateTooltip = styled(Tooltip)`
  && {
    margin-left: 8px;
    color: #b0b2b5;
  }
`;

const CommentContainer = styled.div`
  &{props => ({
    ...props.style,
  })}
`;

const ActionButton = styled.span`
  padding-right: 10px;
  color: rgba(0, 0, 0, 0.45);
  font-size: 12px;
  cursor: pointer;
  -webkit-transition: color 0.3s;
  transition: color 0.3s;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
`;

const CommentListContainer = styled.div`
  padding-left: 30px;
  padding-top: 8px;
  padding-right: 10px;
`;

const DeleteContainer = styled.span`
  padding-right: 5px;
`;

const DeleteButton = ({ isMaintainer, id, deleteComment }) => {
  return isMaintainer ? (
    <DeleteContainer>
      <Tooltip title='Wydupc'>
        <Icon
          type='delete'
          onClick={() => {
            deleteComment({ variables: { _id: id } });
          }}
        />
      </Tooltip>
    </DeleteContainer>
  ) : null;
};

export const Comment = ({ comment, style, isNested, parentId, isMaintainer, refetch }) => {
  const commentContext = useContext(CommentContext);
  const [showAnswers, setShowAnswers] = useState(false);
  const onReply = useCallback(() => {
    if (!isNested) {
      setShowAnswers(true);
    }

    const answeredTo = isNested ? parentId : comment._id;
    commentContext.reply({
      answeredTo,
      userName: comment.addedBy.userName,
    });
  }, []);

  const onShowAnswers = useCallback(() => {
    setShowAnswers(!showAnswers);
  }, [showAnswers]);

  const [deleteComment] = useMutation(DELETE_COMMENT, {
    onCompleted: (data) => {
      if (data.deleteReportComment.__typename === ERROR_RESPONSE) {
        openErrorNotification(data.deleteReportComment.message);
      } else {
        refetch();
      }
    },
  });

  return (
    <CommentContainer style={style}>
      <div style={{ paddingBottom: 15 }}>
        <HeaderSection>
          <DeleteButton key={comment._id} isMaintainer={isMaintainer} id={comment._id} deleteComment={deleteComment} />
          {comment.addedBy.userName}

          <DateTooltip title={moment(comment.creationDate).format('YYYY-MM-DD HH:mm:ss')}>
            <span>{moment(comment.creationDate).fromNow()}</span>
          </DateTooltip>

          <LikeButtons comment={comment} />
        </HeaderSection>
        <MessageSection>{comment.message}</MessageSection>

        <ActionButton onClick={onReply}>Reply</ActionButton>
        {!isNested && comment.answersCount > 0 && <ActionButton onClick={onShowAnswers}>View answers ({comment.answersCount})</ActionButton>}

        {showAnswers && !isNested && (
          <CommentListContainer>
            <CommentList reportId={comment.reportId} parentId={comment._id} isNested={true} />
          </CommentListContainer>
        )}
      </div>
    </CommentContainer>
  );
};
