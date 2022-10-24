import React from 'react';
// This will allow us to access the ID from the URL
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { QUERY_THOUGHT } from '../utils/queries';
import ReactionList from '../components/ReactionList';
import ReactionForm from '../components/ReactionForm';
import Auth from '../utils/auth';

const SingleThought = props => {
  // set the id from the URL to thoughtId
  const { id: thoughtId } = useParams();

  // useQuery is given a second argument in the form of an object
  // This is how you can pass variables to queries that need them.
  // The id property on the variables object will become the $id parameter in the GraphQL query.
  const { loading, data } = useQuery(QUERY_THOUGHT, {
    variables: { id: thoughtId }
  });

  const thought = data?.thought || {};

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="card mb-3">
        <p className="card-header">
          <span style={{ fontWeight: 700 }} className="text-light">
            {thought.username}
          </span>{' '}
          thought on {thought.createdAt}
        </p>
        <div className="card-body">
          <p>{thought.thoughtText}</p>
        </div>
      </div>

      {/* if thought has reactions, render ReactionList component and pass in the reactions array as a prop */}
      {thought.reactionCount > 0 && <ReactionList reactions={thought.reactions} />}
      {/* if user is logged in, render ReactionForm component and pass in thoughtId */}
      {Auth.loggedIn() && <ReactionForm thoughtId={thought._id} />}
    </div>
  );
};

export default SingleThought;
