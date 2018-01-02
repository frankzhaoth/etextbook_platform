<template>
  <div class="login">
  	<h3>Sign In</h3>
  	<input type="email" v-model="email" placeholder="Email"><br>
  	<input type="password" v-model="password" placeholder="Password"><br>
  	<button v-on:click="login">Log in</button>
  	<p>You don't have an account? <router-link to="/sign-up">You can create one</router-link></p>
  </div>
</template>

<script>
import firebase from 'firebase'

export default {
  name: 'Login',
  data () {
    return {
    	email: '',
    	password: ''
    }
  },
  methods: {
  	login: function() {
  		firebase.auth().signInWithEmailAndPassword(this.email, this.password).then(
  			function(user) {
  				alert('You are now connected!')
  			},
  			function(err) {
  				alert('Oops. '+ err.message)
  			}
  		);
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
</style>
