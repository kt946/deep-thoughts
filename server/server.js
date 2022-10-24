const express = require('express');
// import ApolloServer, used to integrate GraphQL into express server
const { ApolloServer } = require('apollo-server-express');
const path = require('path');

// import our typeDefs and resolvers
const { typeDefs, resolvers } = require('./schemas');
// import middleware
const { authMiddleware } = require('./utils/auth');
// import mongoose connection
const db = require('./config/connection');

const PORT = process.env.PORT || 3001;
// create a new Apollo server and pass in our schema data
// we provide the type definitions and resolvers so they know what our API looks like and how it resolves requests.
const server = new ApolloServer({
  typeDefs,
  resolvers,
  // This ensures that every request performs an authentication check, and the updated request object will be passed to the resolvers as the context.
  context: authMiddleware
});

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Serve up static assets
// this will check if the Node environment is in production
// if it is, instruct the Express.js server to serve any files in the React application's build directory in the client folder.
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// this is a wildcard GET route for the server
// if we make a GET request to any location on the server that doesn't have an explicit route defined, respond with the production-ready React front-end code.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// Create a new instance of an Apollo server with the GraphQL schema
// This will create a special /graphql endpoint for the Express.js server that will serve as the main endpoint for accessing the entire API. 
const startApolloServer = async (typeDefs, resolvers) => {
  await server.start();
  // integrate our Apollo server with the Express application as middleware
  server.applyMiddleware({ app });

  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      // log where we can go to tes tour GQL API
      console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
    });
  });
};

// Call the async function to start the server
startApolloServer(typeDefs, resolvers);