import React from 'react';
// With React Router, however, you can't simply use <a> elements.
// Elements like <a href="/login"> would cause the browser to refresh and make a new request to your server for /login.
// This Link component will change the URL while staying on the same page.
import { Link } from 'react-router-dom';
// import AuthService funtionality
import Auth from '../../utils/auth';

const Header = () => {
  // This runs the .logout() method from the AuthService class
  const logout = event => {
    // With the event.preventDefault(), we're actually overriding the <a> element's default nature of having the browser load a different resource.
    event.preventDefault();
    // this will remove the token from localStorage and then refresh the application by taking the user back to the homepage.
    Auth.logout();
  }

  return (
    <header className="bg-secondary mb-4 py-2 flex-row align-center">
      <div className="container flex-row justify-space-between-lg justify-center align-center">
      {/* Link components use a "to" attribute instead of an "href" attribute */}
      <Link to="/">
        <h1>Deep Thoughts</h1>
      </Link>

      <nav className="text-center">
        {/* if Auth.logged in is true (if user is logged in), render link to profile and logout button */}
        {Auth.loggedIn() ? (
          <>
            <Link to="/profile">Me</Link>
            {/* when clicked, this will run the logout function */}
            <a href="/" onClick={logout}>
              Logout
            </a>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>
          </>
        )}
      </nav>
      </div>
    </header>
  );
};

export default Header;
