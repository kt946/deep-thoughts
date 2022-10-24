import React from 'react';
// Apollo Client allows us to connect to a GraphQL API server and execute queries or mutations using their own special form of React Hooks.
// ApolloProvider is a special type of React component used to provide data to all of the other components.
// ApolloClient is a constructor function that will help initialize the connection to the GraphQL API server.
// InMemoryCache enables the Apollo Client instance to cache API response data so that we can perform requests more efficiently.
// createHttpLink allows us to control how the Apollo Client makes a request. Think of it like middleware for the outbound network requests.
import { ApolloProvider, ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
// with setContext, we can create essentially a middleware function that will retrieve the token for us and combine it with the existing httpLink.
import { setContext } from '@apollo/client/link/context';
// this will add client-side routing to the application while keeping the single-page responsiveness
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Header from './components/Header';
import Footer from './components/Footer';

import Home from './pages/Home';
import Login from './pages/Login';
import NoMatch from './pages/NoMatch';
import SingleThought from './pages/SingleThought';
import Profile from './pages/Profile';
import Signup from './pages/Signup';

// establish a link to the GraphQL server at its /graphql endpoint
const httpLink = createHttpLink({
  // URI stands for "Uniform Resource Identifier."
  // also add "proxy": "http://localhost:3001" to client's package.json
  // now this will work in both development and production environments
  uri: '/graphql',
});

// this will retrieve the token from localStorage and set the HTTP request headers of every request to include the token, whether the request needs it or not.
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('id_token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// use the ApolloClient() constructor to instantiate the Apollo Client instance and create the connection to the API endpoint. 
const client = new ApolloClient({
  // this combines the authLink and httpLink objects so that every request retrieves the token and sets the request headers before making the request to the API.
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

function App() {
  return (
    // This enables our entire application to interact with our Apollo Client instance.
    // Because we're passing the client variable in as the value for the client prop in the provider, 
    // everything between the JSX tags will have access to the server's API data through the client we set up.
    <ApolloProvider client={client}>
      {/* Wrapping elements in a Router component makes all of the child components aware of client-side routing */}
      <Router>
        <div className="flex-column justify-flex-start min-100-vh">
          <Header />
          <div className="container">
            {/* this will hold the Route components that signify this part of the app as the place where content will change according to the URL route. */}
            {/* the Router component will always contain within it the Routes component. */}
            {/* the Routes component will contain within it the Route component. */}
            <Routes>
              <Route
                path="/"
                element={<Home />}
              />
              <Route
                path="/login"
                element={<Login />}
              />
              <Route
                path="/signup"
                element={<Signup />}
              />
              <Route path="/profile">
                {/* These two nested routes will allow us to use optional parameters for /profile*/}
                {/* This will check for a /:username parameter first; if none is provided in the URL path, we'll render the <Profile> component without one.*/}
                <Route path=":username" element={<Profile />} />
                <Route path="" element={<Profile />} />
              </Route>
              <Route
                path="/thought/:id"
                element={<SingleThought />}
              />
              <Route
                path="*"
                element={<NoMatch />}
              />
            </Routes>
          </div>
          <Footer />
        </div>
      </Router>
    </ApolloProvider>
  );
}

export default App;
