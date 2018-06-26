// ./src/pages/new.js
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import shortId from 'short-id';
import { Button } from '../styledComponents/theme';

class MessagePage extends Component {
  static contextTypes = {
    firebase: PropTypes.object,
  };

  static propTypes = {
    uid: PropTypes.string,
  };

  state = {
    text: '',
    loading: false,
  };

  onTextChange = e => {
    this.setState({
      text: e.target.value,
    });
  };

  handleCreate = () => {
    const pollId = shortId.generate();
    const { signIn, uid } = this.props;

    this.setState({
      loading: true,
    });

    if (!uid) {
      // due to our database rules, we can't write unless a uid exists
      signIn('anonymous').then(() => {
        this.createMessage(pollId);
      });
    } else {
      this.createMessage(pollId);
    }
  };

  createMessage(pollId) {
    const { firebase } = this.context;
    const { text } = this.state;
    const { uid } = this.props;

    firebase.messages
      .doc(pollId)
      .set({
        original: text,
        authorId: uid,
      })
      .then(() => {
        this.setState({
          text: '',
        });
      })
      .catch(error => {
        // eslint-disable-next-line no-console
        console.error(error);
        // TODO: notify the user of the error
      });
  }

  render() {
    const { firebase } = this.context;
    const { text } = this.state;

    return (
      <div>
        <input value={text} onChange={e => this.onTextChange(e)} />
        <Button onClick={this.handleCreate}>create</Button>
      </div>
    );
  }
}

export default MessagePage;
