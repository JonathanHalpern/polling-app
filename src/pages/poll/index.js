// ./src/pages/poll/index.js
import React from 'react';
import PropTypes from 'prop-types';
import { Route } from 'react-router-dom';

import Poll from '../../containers/Poll';
import Polls from '../../containers/Polls';

const PollPage = ({ uid, signIn }) => {
  return (
    <Route
      render={({ location }) => {
        return (
          <div>
            <Route
              exact
              path="/poll/"
              render={props => <Polls {...props} uid={uid} signIn={signIn} />}
            />
            <Route
              location={location}
              key={location.key}
              path="/poll/:pollId/"
              render={props => <Poll {...props} uid={uid} signIn={signIn} />}
            />
          </div>
        );
      }}
    />
  );
};

PollPage.propTypes = {
  uid: PropTypes.string,
  signIn: PropTypes.func.isRequired,
};

export default PollPage;
