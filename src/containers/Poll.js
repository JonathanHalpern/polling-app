// ./src/containers/Poll.js
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Poll from '../components/Poll';

class PollContainer extends Component {
  static contextTypes = {
    firebase: PropTypes.object,
  };

  static propTypes = {
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    uid: PropTypes.string,
    signIn: PropTypes.func.isRequired,
  };

  state = {
    title: '',
    imageUrl: '',
    // options is a map with the optionId as the keys and
    // option data including results as the values
    options: {},
    loading: false,
    isAuthor: false,
    selection: '',
    hasVoted: false,
  };

  // pull the pollId from the route param, then fetch the poll
  componentDidMount() {
    const { history, match, uid } = this.props;

    if (match.params.pollId.length === 6) {
      if (uid) {
        this.checkVote(uid);
        this.checkAuthor(uid);
      }

      this.setState({
        loading: true,
      });

      this.poll.onSnapshot(doc => {
        console.log('Current data: ', doc.data());
        if (doc.exists) {
          const { title, options, imageUrl } = doc.data();
          this.setState({
            loading: false,
            title,
            imageUrl,
            options: options.reduce((aggr, curr) => {
              return {
                ...aggr,
                [curr.optionId]: {
                  ...curr,
                  votes: 0,
                },
              };
            }, {}),
          });
        } else {
          history.push('/404');
        }
      });

      // this.poll
      //   .get()
      //   .then(doc => {
      //     if (doc.exists) {
      //       const { title, options, imageUrl } = doc.data();
      //       this.setState({
      //         loading: false,
      //         title,
      //         imageUrl,
      //         options: options.reduce((aggr, curr) => {
      //           return {
      //             ...aggr,
      //             [curr.optionId]: {
      //               ...curr,
      //               votes: 0,
      //             },
      //           };
      //         }, {}),
      //       });
      //     } else {
      //       history.push('/404');
      //     }
      //   })
      //   .catch(error => {
      //     // eslint-disable-next-line no-console
      //     console.error(error);
      //     // TODO: notify the user of the error
      //   });
    } else {
      history.push('/404');
    }
  }

  // since we don't know when the user will be authenticated if ever,
  // we need to add checks here and sign in anonymously if not
  componentWillReceiveProps(nextProps) {
    const { uid } = this.props;
    const { uid: nextUid } = nextProps;

    if ((!uid && !nextUid) || (uid && !nextUid)) {
      this.signInAnonymously();
    } else {
      // a uid exists, check if the user has already voted
      this.checkVote(nextUid);
      this.checkAuthor(nextUid);
    }
  }

  componentWillUnmount() {
    if (this.stopResultListener) {
      this.stopResultListener();
    }
  }

  get poll() {
    const { firebase } = this.context;
    const { match } = this.props;

    return firebase.polls.doc(match.params.pollId);
  }

  get results() {
    // get the results sub-collection on the poll document
    return this.poll.collection('results');
  }

  fetchOptions = () => {
    const { history } = this.props;
    this.poll
      .get()
      .then(doc => {
        if (doc.exists) {
          const { title, options, imageUrl } = doc.data();
          this.setState({
            loading: false,
            title,
            imageUrl,
            options: options.reduce((aggr, curr) => {
              return {
                ...aggr,
                [curr.optionId]: {
                  ...curr,
                  votes: 0,
                },
              };
            }, {}),
          });
        } else {
          history.push('/404');
        }
      })
      .catch(error => {
        // eslint-disable-next-line no-console
        console.error(error);
        // TODO: notify the user of the error
      });
  };

  handleSelectOption = id => {
    this.setState({
      selection: id,
    });
  };

  handleVote = () => {
    const { uid } = this.props;
    const { selection } = this.state;
    const vote = uid => {
      this.setState({
        loading: true,
      });

      // store the users vote in a sub-collection
      this.results
        .doc(uid)
        .set({
          optionId: selection,
          uid,
        })
        .then(() => {
          this.setState({
            loading: false,
            hasVoted: true,
          });

          this.startResultListener();
        });
    };
    // in the case a user votes and they've not been logged in
    if (!uid) {
      this.signInAnonymously().then(({ uid }) => {
        vote(uid);
      });
    } else {
      vote(uid);
    }
  };

  handleChangeVote = () => {
    const { options } = this.state;
    this.setState({
      hasVoted: false,
    });
    this.fetchOptions();
  };

  handleDelete = () => {
    const { match, history } = this.props;
    const { firebase } = this.context;
    firebase.polls
      .doc(match.params.pollId)
      .delete()
      .then(() => {
        history.push('/');
      });
  };

  signInAnonymously() {
    const { signIn } = this.props;

    return signIn('anonymous').catch(error => {
      // eslint-disable-next-line no-console
      console.error(error);
      // TODO: notify the user of the error
    });
  }

  checkAuthor(uid) {
    this.poll
      .get()
      .then(doc => {
        if (doc.exists) {
          const { authorId } = doc.data();
          this.setState({
            isAuthor: uid === authorId,
          });
        }
      })
      .catch(error => {
        // eslint-disable-next-line no-console
        console.error(error);
        // TODO: notify the user of the error
      });
  }

  checkVote(uid) {
    this.results
      .doc(uid)
      .get()
      .then(resultDoc => {
        if (resultDoc.exists) {
          const { optionId } = resultDoc.data();

          this.setState({
            selection: optionId,
            hasVoted: true,
          });

          // start listening to result changes since there
          // user has voted.
          this.startResultListener();
        }
      })
      .catch(error => {
        // eslint-disable-next-line no-console
        console.error(error);
        // TODO: notify the user of the error
      });
  }

  startResultListener() {
    // set an unsubscribe reference on the instance, so that
    // we can stop listening when the component unmounts
    this.stopResultListener = this.results.onSnapshot(
      snapshot => {
        snapshot.docChanges().forEach(change => {
          const { optionId } = change.doc.data();

          if (change.type === 'added') {
            this.setState(prevState => {
              return {
                ...prevState,
                options: {
                  ...prevState.options,
                  [optionId]: {
                    ...prevState.options[optionId],
                    votes: prevState.options[optionId].votes + 1,
                  },
                },
              };
            });
          }
          if (change.type === 'removed') {
            console.log('gone!!');
            // currently there's no way of changing a user's vote after it
            // has been saved. We could accomplish this by deleting the
            // user's uid document on the results sub-collection. This
            // is where we'd remove the vote from the UI when that'd happen.
          }
        });
      },
      error => {
        // eslint-disable-next-line no-console
        console.error(error);
        // TODO: notify the user of the error
      },
    );
  }

  render() {
    return (
      <Poll
        {...this.state}
        onSelectOption={this.handleSelectOption}
        onVote={this.handleVote}
        onChangeVote={this.handleChangeVote}
        onDelete={this.handleDelete}
      />
    );
  }
}

export default PollContainer;
