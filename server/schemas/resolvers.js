const { User, Thought } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
// used to sign a token
const { signToken } = require('../utils/auth');

// Resolvers are simply the functions we connect to each query or mutation type definition 
// that perform the CRUD actions that each query or mutation is expected to perform.
const resolvers = {
  // used for retrieving/reading data; GET requests
  Query: {
    // These methods get the same name of the query or mutation they are resolvers for.
    // This methods checks for the existence of context.user. If no context.user property exists, 
    // then we know that the user isn't authenticated and we can throw an AuthenticationError.
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id })
          .select('-__v -password')
          .populate('thoughts')
          .populate('friends');
    
        return userData;
      }
    
      throw new AuthenticationError('Not logged in');
    },

    // get all users
    users: async () => {
      return User.find()
        // omit mongoose-specific __v property and user's password information
        .select('-__v -password')
        // populate friends and thoughts fields
        .populate('friends')
        .populate('thoughts');
    },

    // get a user by username
    user: async (parent, { username }) => {
      return User.findOne({ username })
        .select('-__v -password')
        .populate('friends')
        .populate('thoughts');
    },

    // get all thoughts
    // parent is used as a placeholder parameter, it won't be used, but we need something in that spot 
    // so we can access the username argument from the second parameter.
    thoughts: async (parent, { username }) => {
      // ternary operator to check if username exists
      // If it does, we set params to an object with a username key set to that value. 
      // If it doesn't, we simply return an empty object.
      const params = username ? { username } : {};
      // If there's data, it'll perform a lookup by a specific username. If there's not, it'll simply return every thought.
      return Thought.find(params).sort({ createdAt: -1 });
    },

    // get a thought by id
    // destructure _id from argument value and use it to look up a single thought by its _id
    thought: async (parent, { _id }) => {
      return Thought.findOne({ _id });
    }
  },
  // used for creating, updating, deleting data; POST/PUT/DELETE requests
  Mutation: {
    // create a new user in the database with whatever is passed in as the args.
    addUser: async (parent, args) => {
      const user = await User.create(args);
      // sign a token
      const token = signToken(user);
    
      // return an object that combines the token with the user's data
      return { token, user };
    },

    // log in the user
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });
    
      // make sure the error message doesn't specify whether the email or password is incorrect. 
      if (!user) {
        throw new AuthenticationError('Incorrect credentials');
      }
    
      const correctPw = await user.isCorrectPassword(password);
    
      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }
    
      const token = signToken(user);
      return { token, user };
    },
    
    // add a thought
    addThought: async (parent, args, context) => {
      // Only logged-in users should be able to use this mutation, hence why we check for the existence of context.user first. 
      if (context.user) {
        const thought = await Thought.create({ ...args, username: context.user.username });
    
        await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $push: { thoughts: thought._id } },
          // without this, Mongo would return the original document instead of the updated document
          { new: true }
        );
    
        return thought;
      }
    
      throw new AuthenticationError('You need to be logged in!');
    },

    // add a reaction
    addReaction: async (parent, { thoughtId, reactionBody }, context) => {
      if (context.user) {
        // Reactions are stored as arras on the Thought model
        // Because we're updating an existing thought, the client will need to provide the corresponding thoughtId. 
        const updatedThought = await Thought.findOneAndUpdate(
          { _id: thoughtId },
          { $push: { reactions: { reactionBody, username: context.user.username } } },
          { new: true, runValidators: true }
        );
    
        return updatedThought;
      }
    
      throw new AuthenticationError('You need to be logged in!');
    },

    // add a friend
    addFriend: async (parent, { friendId }, context) => {
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          // find a user with an _id that is equal to the context.user._id
          { _id: context.user._id },
          // add the friend's _id to the current user's friends array.
          { $addToSet: { friends: friendId } },
          { new: true }
        ).populate('friends');
    
        return updatedUser;
      }
    
      throw new AuthenticationError('You need to be logged in!');
    }
  }
};

module.exports = resolvers;