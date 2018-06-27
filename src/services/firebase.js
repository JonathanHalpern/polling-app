// ./src/services/firebase.js
import firebase from 'firebase';
import 'firebase/firestore';

const config = {
  apiKey: 'AIzaSyBHe3URdyc5xA_EODBULvZeryEOkJ1BIuE',
  authDomain: 'polling-app-88df9.firebaseapp.com',
  databaseURL: 'https://polling-app-88df9.firebaseio.com',
  projectId: 'polling-app-88df9',
  storageBucket: 'polling-app-88df9.appspot.com',
  messagingSenderId: '968428564609',
};

class Firebase {
  constructor() {
    firebase.initializeApp(config);
    this.store = firebase.firestore;
    this.storage = firebase.storage;
    this.auth = firebase.auth;
    // this._messaging = firebase.messaging;
    const messaging = firebase.messaging();
    messaging.usePublicVapidKey(
      'BM2fvm5_DRDs7t5YRCDhCF_Q7vANIPI9dJURQ0Gf3TkAVcwsTFGYR4saCuO0tlvTa8ZUGo6gV7pbIxjzwrtK5jM',
    );
    messaging.getToken().then(refreshedToken => {
      console.log(refreshedToken);
    });
  }

  get polls() {
    return this.store().collection('polls');
  }

  get messages() {
    return this.store().collection('messages');
  }

  // get messaging() {
  //   const a = this._messaging();
  //   // a.usePublicVapidKey(
  //   //   'BM2fvm5_DRDs7t5YRCDhCF_Q7vANIPI9dJURQ0Gf3TkAVcwsTFGYR4saCuO0tlvTa8ZUGo6gV7pbIxjzwrtK5jM',
  //   // );
  //   return a;
  // }

  get images() {
    return this.storage()
      .ref()
      .child('images');
  }
}

export default new Firebase();
