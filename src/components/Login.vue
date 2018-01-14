<template>
  <div class="login">
  	<h3>Log In</h3>
    <p v-if="errorMessage">{{errorMessage}}</p>
  	<input type="email" v-model="email" v-bind:class="{error: errorMessage}" placeholder="Email"><br>
  	<input type="password" v-model="password" v-bind:class="{error: errorMessage}" placeholder="Password"><br>
  	<button v-on:click="login">Log in</button>
  	<p>You don't have an account? <router-link to="/sign-up">You can create one</router-link></p>
    <p>Forgot your password?<router-link to="/pass-reset">Reset it</router-link></p>
  </div>
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
      })
      .then(function(user) {
  				self.$router.replace('dashboard');
  		});
  	}
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
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
