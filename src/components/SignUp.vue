<template>
  <div class="signUp">
  	<h3>Let's create a new account!</h3>
  	<p v-if="errorMessage">{{errorMessage}}</p>
    <input type="email" v-model="email" v-bind:class="{error: errorMessage}" placeholder="Email"><br>
    <input type="password" v-model="password" v-bind:class="{error: errorMessage}" placeholder="Password"><br>
  	<button v-on:click="signUp">Sign Up</button>
  	<span>Already have an account? <router-link to="/login">Login</router-link></span>
  </div>
</template>

<script>
import firebase from 'firebase'

export default {
  name: 'SignUp',
  data: function() {
    return {
    	email: '',
    	password: '',
      errorMessage: ''
    }
  },
  methods: {
  	signUp: function() {
      let self = this;
  		firebase.auth().createUserWithEmailAndPassword(this.email, this.password)
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
      })
      .then(function(user) {
        firebase.database().ref('/users/' + user.uid).set({email: user.email});
        self.$router.replace('dashboard');
		  });
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
	.signUp {
		margin-top: 40px;
	}
	input {
		margin: 10px 0;
		width: 20%;
		padding: 15px;
	}
	button {
		margin-top: 10px;
		width: 10%;
		cursor: pointer;
	}
	span {
		display: block;
		margin-top: 20px;
		font-size: 11px;
	}
  .error {
    border: 1px solid #CF3A24;
  }
</style>
