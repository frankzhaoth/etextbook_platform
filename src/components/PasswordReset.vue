<template>
  <div class="passReset">
  	<h3>Password Reset</h3>
    <p v-if="errorMessage">{{errorMessage}}</p>
  	<input type="email" v-model="email" v-bind:class="{error: errorMessage}" placeholder="Email"><br>
  	
  	<button v-on:click="reset">Reset</button>
  	<p>Remember your password? <router-link to="/login">Log in</router-link></p>
  	<p>{{resetMsg}}</p>
  </div>
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
      })
      .then(function(user) {
  				self.resetMsg = "An email for password reset has been sent."
  		});
  	}
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
	.login {
		margin-top: 40px;
	}
	input {
		margin: 10px 0;
		width: 20%;
		padding: 15px;
	}
	button {
		margin-top: 20px;
		width: 10%;
		cursor: pointer;
	}
	p {
		margin-top: 20px;
		font-size: 11px;
	}
	p a {
		text-decoration: underline;
		cursor: pointer;
	}
  .error {
    border: 1px solid #CF3A24;
  }
</style>
