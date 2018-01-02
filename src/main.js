// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import firebase from 'firebase'

Vue.config.productionTip = false

let app;
// Initialize Firebase
let config = {
  apiKey: "AIzaSyDlDn-C8oUh1lEHUABw3dPeZOioPEY142E",
  authDomain: "ece496-etext.firebaseapp.com",
  databaseURL: "https://ece496-etext.firebaseio.com",
  projectId: "ece496-etext",
  storageBucket: "ece496-etext.appspot.com",
  messagingSenderId: "102637668482"
};

firebase.initializeApp(config);
firebase.auth().onAuthStateChanged(function(user) {
	if (!app) {
		/* eslint-disable no-new */
		new Vue({
		  el: '#app',
		  router,
		  template: '<App/>',
		  components: { App }
		})
	}
});
