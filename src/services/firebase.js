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
  }

  get polls() {
    return this.store().collection('polls');
  }

  get images() {
    return this.storage()
      .ref()
      .child('images');
  }
}

export default new Firebase();
