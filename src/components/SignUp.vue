<template>
  <v-container style="background: #9A3658;" fluid fill-height id="signUp">
    <v-layout row wrap align-center>
      <v-flex xs12 sm6 lg4 offset-sm3 offset-lg4>
        <img id="logo" src="static/logo_white.png" />
        <v-card class="pa-3 mt-4" style="border-radius: 6px;">
          <v-card-text>
            <h1 class="text-xs-center title mb-3">Let's create a new account!</h1>
            <v-text-field @keyup.enter="signUp" label="Name" v-model="name" required></v-text-field>
            <v-text-field @keyup.enter="signUp" label="E-mail" v-model="email" required></v-text-field>
            <v-text-field @keyup.enter="signUp" label="Password" v-model="password" type="password" required></v-text-field>
            <div class="text-xs-center">
              <v-btn type="button" color="primary" depressed v-on:click="signUp">Sign Up</v-btn>
              <p class="error-text">{{errorMessage}}</p>
            </div>
            <p class="text-xs-center caption mt-5 mb-0">Already have an account? <router-link to="/login">Login</router-link></p>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>  
</template>

<script>
import firebase from 'firebase'

export default {
  name: 'SignUp',
  data: function() {
    return {
      name: '',
    	email: '',
    	password: '',
      errorMessage: ''
    }
  },
  methods: {
  	signUp: function() {
      if (this.name === '') {
        this.errorMessage = 'Please enter your name.'
        return;
      }

      let self = this;
  		firebase.auth().createUserWithEmailAndPassword(this.email, this.password)
      .then(function(user) {
        firebase.database().ref('/users/' + user.uid).set({email: user.email, name: self.name});
        firebase.auth().currentUser.sendEmailVerification().then(function() {
          self.$router.replace('dashboard');
        });
      })
      .catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        if (errorCode === 'auth/invalid-email') {
          self.errorMessage = 'Please enter a valid email.';
        }
        else if (errorCode === 'auth/email-already-in-use') {
          self.errorMessage = 'This email is already in use.';
        }
        else if (errorCode === 'auth/weak-password') {
          self.errorMessage = 'The password is too weak.';
        }
        else {
          self.errorMessage = errorMessage;
        }
      });
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
	#signUp .title {
    font-weight: 400;
  }

  #signUp .error-text {
    color: #FF5252;
  }

  #logo {
    width: 34%;
    display: block;
    margin: 0 auto;
  }
</style>
