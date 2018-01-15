<template>
  <v-container fill-height id="passReset">
    <v-layout row wrap align-center>
      <v-flex xs4 offset-xs4>
        <v-card class="pa-3">
          <v-card-text>
            <h1 class="text-xs-center title mb-3">Password Reset</h1>
            <v-text-field @keyup.enter="reset" label="E-mail" v-model="email" required></v-text-field>
            <div class="text-xs-center">
              <v-btn type="button" color="primary" round v-on:click="reset">Reset</v-btn>
              <p class="error-text">{{errorMessage}}</p>
            </div>
            <p class="text-xs-center caption mt-5 mb-0">Remember your password? <router-link to="/login">Log in</router-link></p>
            <p class="text-xs-center">{{resetMsg}}</p>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>  
</template>

<script>
import firebase from 'firebase'

export default {
  name: 'PasswordReset',
  data () {
    return {
    	email: '',
      errorMessage: '',
      resetMsg: ''
    }
  },
  methods: {
  	reset: function() {
      let self = this;
      let auth = firebase.auth();
  		auth.sendPasswordResetEmail(this.email)
      .then(function(user) {
          self.resetMsg = "An email for password reset has been sent."
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

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
	#passReset .title {
    font-weight: 400;
  }

  #passReset .error-text {
    color: #FF5252;
  }
</style>
