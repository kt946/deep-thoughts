import React from 'react';
import { Navigate, useParams } from 'react-router-dom';

import ThoughtList from '../components/ThoughtList';
import FriendList from '../components/FriendList';
import ThoughtForm from '../components/ThoughtForm';

import { useQuery, useMutation } from '@apollo/client';
import { QUERY_USER, QUERY_ME } from '../utils/queries';
import { ADD_FRIEND } from '../utils/mutations';
import Auth from '../utils/auth';

const Profile = () => {
  // The useParams Hook retrieves the username from the URL.
  const { username: userParam } = useParams();

  // username is then passed to the useQuery Hook
  // If there is a value in userParam that we got from the URL bar, we'll use that value to run the QUERY_USER query.
  // If there's no value in userParam, like if we simply visit /profile as a logged-in user, we'll execute the QUERY_ME query instead.
  const { loading, data } = useQuery(userParam ? QUERY_USER : QUERY_ME, {
    variables: { username: userParam }
  });
  const [addFriend] = useMutation(ADD_FRIEND);

  // set user variable to handle each type of response
  // if QUERY_ME is run, response will return with data in the 'me' property
  // if QUERY_USER is run, response will return with data in the 'user' property
  const user = data?.me || data?.user || {};
  
  // navigate to personal profile page if username is the same as the logged-in user's
  if (Auth.loggedIn() && Auth.getProfile().data.username === userParam) {
    // Navigate component will allow us to redirect the user to another route within the application.
    return <Navigate to="/profile" />;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  // if there is no user data to display, we know that we aren't logged in or at another user's profile page.
  // Instead of redirecting the user away, we inform the user that they need to be logged in to see this page and they must log in or sign up to use it.
  if (!user?.username) {
    return (
      <h4>
        You need to be logged in to see this page. Use the navigation links above to sign up or log in!
      </h4>
    );
  }

  const handleClick = async () => {
    try {
      await addFriend({
        variables: { id: user._id }
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <div className="flex-row mb-3">
        <h2 className="bg-dark text-secondary p-3 display-inline-block">
          {/* if userParam doesn't exist, we'll get a message saying "Viewing your profile." Otherwise, it will display the username of the other user on their profile. */}
          Viewing {userParam ? `${user.username}'s` : 'your'} profile.
        </h2>

        {/* userParam is only defined when the route includes a username */}
        {/* button won't display when the route is /profile */}
        {userParam && (
          <button className="btn ml-auto" onClick={handleClick}>
            Add Friend
          </button>
        )}
      </div>

      <div className="flex-row justify-space-between mb-3">
        <div className="col-12 mb-3 col-lg-8">
          <ThoughtList thoughts={user.thoughts} title={`${user.username}'s thoughts...`} />
        </div>

        <div className="col-12 col-lg-3 mb-3">
          <FriendList
            username={user.username}
            friendCount={user.friendCount}
            friends={user.friends}
          />
        </div>
      </div>
      {/* thoughtForm only displays on the user's own Profile page, not on other users' pages.*/}
      <div className="mb-3">{!userParam && <ThoughtForm />}</div>
    </div>
  );
};

export default Profile;
