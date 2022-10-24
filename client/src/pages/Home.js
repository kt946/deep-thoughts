import React from 'react';
// this will allow us to make requests to the GraphQL server we connected to and made available to the application using the <ApolloProvider> component in App.js
import { useQuery } from '@apollo/client';
import { QUERY_THOUGHTS, QUERY_ME_BASIC } from '../utils/queries';
import ThoughtList from '../components/ThoughtList';
import FriendList from '../components/FriendList';
import ThoughtForm from '../components/ThoughtForm';
import Auth from '../utils/auth';

const Home = () => {
  // use useQuery hook to make query request
  // asynchronous request, like using fetch(); also provides a loading property to indicate request isn't done yet
  const { loading, data } = useQuery(QUERY_THOUGHTS);
  // use object destructuring to extract `data` from the `useQuery` Hook's response and rename it `userData` to be more descriptive
  const { data: userData } = useQuery(QUERY_ME_BASIC);

  // This is called optional chaining
  // Optional chaining negates the need to check if an object even exists before accessing its properties.
  // In this case, no data will exist until the query to the server is finished
  // if data exists, store it in the thoughts constant; if undefined, then save an empty array to the thoughts component
  const thoughts = data?.thoughts || [];
  console.log(thoughts);

  // check the logged in status of a user; returns true if logged in
  const loggedIn = Auth.loggedIn();

  return (
    <main>
      <div className="flex-row justify-space-between">
        {/* if user is logged in, display thought form */}
        {loggedIn && (
          <div className="col-12 mb-3">
            <ThoughtForm />
          </div>
        )}
        {/* if user is logged in, add class 'col-lg-8 to this div to make room for friendlist */}
        <div className={`col-12 mb-3 ${loggedIn && 'col-lg-8'}`}>
          {/* if data is loading, display loading message; else if query is complete, display thought list */}
          {loading ? (
            <div>Loading...</div>
          ) : (
            <ThoughtList thoughts={thoughts} title="Some Feed for Thought(s)..." />
          )}
        </div>
        {/* if user is logged in and has data in userData, display friend list; else display nothing */}
        {loggedIn && userData ? (
          <div className="col-12 col-lg-3 mb-3">
            <FriendList
              username={userData.me.username}
              friendCount={userData.me.friendCount}
              friends={userData.me.friends}
            />
          </div>
        ) : null}
      </div>
    </main>
  );
};

export default Home;
