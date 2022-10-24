import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { ADD_THOUGHT } from '../../utils/mutations';
import { QUERY_THOUGHTS, QUERY_ME } from '../../utils/queries';

const ThoughtForm = () => {
  const [thoughtText, setText] = useState('');
  const [characterCount, setCharacterCount] = useState(0);
  const [addThought, { error }] = useMutation(ADD_THOUGHT, {
    // this update function allows us to update the cache of any related queries
    update(cache, { data: { addThought } }) {
      // could potentially not exist yet, so wrap in a try/catch
      try {
        // update me array's cache
        const { me } = cache.readQuery({ query: QUERY_ME });
        cache.writeQuery({
          query: QUERY_ME,
          data: { me: { ...me, thoughts: [...me.thoughts, addThought] } },
        });
      } catch (e) {
        console.warn("First thought insertion by user!")
      }

      // update thought array's cache
      // read what's currently in the cache
      const { thoughts } = cache.readQuery({ query: QUERY_THOUGHTS });
      // prepend the newest thought to the front of the array
      cache.writeQuery({
        query: QUERY_THOUGHTS,
        data: { thoughts: [addThought, ...thoughts] },
      });
    }
  });

  // the handleChange() function stops updating the value of thoughtText once the character count reaches 280.
  const handleChange = event => {
    if (event.target.value.length <= 280) {
      setText(event.target.value);
      setCharacterCount(event.target.value.length);
    }
  };

  const handleFormSubmit = async event => {
    event.preventDefault();
  
    try {
      // add thought to database
      await addThought({
        variables: { thoughtText }
      });
  
      // clear form value
      setText('');
      setCharacterCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      {/* if character count is 280, add 'text-error' class */}
      <p className={`m-0 ${characterCount === 280 || error ? 'text-error' : ''}`}>
        Character Count: {characterCount}/280
        {/* if error exists, render message */}
        {error && <span className="ml-2">Something went wrong...</span>}
      </p>
      <form 
        className="flex-row justify-center justify-space-between-md align-stretch"
        onSubmit={handleFormSubmit}
      >
        <textarea
          placeholder="Here's a new thought..."
          value={thoughtText}
          className="form-input col-12 col-md-9"
          onChange={handleChange}
        ></textarea>
        <button className="btn col-12 col-md-3" type="submit">
          Submit
        </button>
      </form>
    </div>
  );
};

export default ThoughtForm;