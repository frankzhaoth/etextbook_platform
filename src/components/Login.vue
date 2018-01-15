<template>
  <v-container fill-height id="login">
    <v-layout row wrap align-center>
      <v-flex xs4 offset-xs4>
        <v-card class="pa-3">
          <v-card-text>
            <h1 class="text-xs-center title mb-3">Login</h1>
            <v-text-field @keyup.enter="login" label="E-mail" v-model="email" required></v-text-field>
            <v-text-field @keyup.enter="login" label="Password" v-model="password" required></v-text-field>
            <div class="text-xs-center">
              <v-btn type="button" color="primary" round v-on:click="login">Log in</v-btn>
              <p class="error-text">{{errorMessage}}</p>
            </div>
            <p class="text-xs-center caption mt-5 mb-0">You don't have an account? <router-link to="/sign-up">Register</router-link></p>
            <p class="text-xs-center caption"><router-link to="/password-reset">Forgot your password?</router-link></p>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>  	
</template>

<script>
import firebase from 'firebase'

export default {
  name: 'Login',
  data () {
    return {
    	email: '',
    	password: '',
      errorMessage: ''
    }
  },
  methods: {
  	login: function() {
      let self = this;
  		firebase.auth().signInWithEmailAndPassword(this.email, this.password)
      .then(function(user) {
          self.$router.replace('dashboard');
      })
      .catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        if (errorCode == 'auth/invalid-email') {
          self.errorMessage = 'Please enter a valid email.';
        }
        else if (errorCode == 'auth/user-not-found') {
          self.errorMessage = 'This email is not registered.';
        }
        else if (errorCode == 'auth/wrong-password') {
          self.errorMessage = 'The password for this user is incorrect. Please try again.';
        }
        else if (errorCode == 'auth/user-disabled') {
          self.errorMessage = 'This user has been disabled. Please contact support.';
        }
        else {
          self.errorMessage = errorMessage;
        }
        console.log(self.errorMessage);
      });
  	}
  }
}
</script>

<style scoped>
  #login .title {
    font-weight: 400;
  }

  #login .error-text {
    color: #FF5252;
  }
</style>
