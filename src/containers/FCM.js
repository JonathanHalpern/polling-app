import React from 'react';
import PropTypes from 'prop-types';

const INITIAL_STATE = {
  uid: '',
  isAnonymous: null,
  // // some other properties from the user object that may be useful
  email: '',
  displayName: '',
  photoURL: '',
};

class FCM extends React.Component {
  static contextTypes = {
    firebase: PropTypes.object,
  };

  static propTypes = {
    uid: PropTypes.string,
  };

  state = INITIAL_STATE;

  componentDidMount() {
    this.requestMessagingPermission();
  }

  get user() {
    const { firebase } = this.context;
    const { uid } = this.props;

    return firebase.users.doc(uid);
  }

  requestMessagingPermission() {
    const { messaging } = this.context.firebase;
    messaging.usePublicVapidKey(
      'BM2fvm5_DRDs7t5YRCDhCF_Q7vANIPI9dJURQ0Gf3TkAVcwsTFGYR4saCuO0tlvTa8ZUGo6gV7pbIxjzwrtK5jM',
    );

    messaging
      .requestPermission()
      .then(() => {
        console.log('got permission');
        return messaging.getToken();
      })
      .then(fcmToken => {
        console.log(fcmToken);

        this.user.set({
          fcmToken,
        });
      })
      .catch(err => {
        console.log(err);
      });

    messaging.onMessage(payload => {
      console.log('Message received. ', payload);
      // ...
    });
  }

  render() {
    return null;
  }
}

export default FCM;
