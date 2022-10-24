import React from 'react';
import { Link } from 'react-router-dom';

// Three props are passed to FriendList:
// the username whose friends these belong to, the friend count, and the actual array of friends. 
const FriendList = ({ friendCount, username, friends }) => {
  // if user has no friends
  if (!friends || !friends.length) {
    return <p className="bg-dark text-light p-3">{username}, make some friends!</p>;
  }

  // if user has friends
  return (
    <div>
      <h5>
        {username}'s {friendCount} {friendCount === 1 ? 'friend' : 'friends'}
      </h5>
      {friends.map(friend => (
        <button className="btn w-100 display-block mb-2" key={friend._id}>
          <Link to={`/profile/${friend.username}`}>{friend.username}</Link>
        </button>
      ))}
    </div>
  );
};

export default FriendList;