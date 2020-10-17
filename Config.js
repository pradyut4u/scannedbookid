import * as firebase from 'firebase'
require('@firebase/firestore')
  // Your web app's Firebase configuration
  var firebaseConfig = {
    apiKey: "AIzaSyAYVMV8EzoW0hp1XsDv_yrWatGswOzOoXw",
    authDomain: "synchrounous-7faff.firebaseapp.com",
    databaseURL: "https://synchrounous-7faff.firebaseio.com",
    projectId: "synchrounous-7faff",
    storageBucket: "synchrounous-7faff.appspot.com",
    messagingSenderId: "152572013753",
    appId: "1:152572013753:web:136d212426d58cf050bf68"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  export default firebase.firestore()