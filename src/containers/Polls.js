// ./src/containers/Poll.js
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import PollPreview from '../components/PollPreview';

class PollsContainer extends Component {
  static contextTypes = {
    firebase: PropTypes.object,
  };

  static propTypes = {
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    signIn: PropTypes.func.isRequired,
  };

  state = {
    loading: false,
    polls: [],
  };

  componentDidMount() {
    this.setState({
      loading: true,
    });

    this.polls.get().then(querySnapshot => {
      this.setState({
        polls: querySnapshot.docs.map(doc => doc.data()),
        loading: false,
      });
    });
  }

  get polls() {
    const { firebase } = this.context;
    return firebase.polls;
  }

  render() {
    const { polls, loading } = this.state;
    return (
      <div>
        {loading ? (
          <p>Loading...</p>
        ) : (
          polls.map(poll => <PollPreview {...poll} />)
        )}
      </div>
    );
  }
}

export default PollsContainer;
