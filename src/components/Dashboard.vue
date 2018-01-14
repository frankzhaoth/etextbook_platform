<template>
  <div class="dashboard">
    <v-toolbar dark color="primary">
      <v-toolbar-title class="white--text">My Dashboard</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn flat v-on:click="logout">Logout</v-btn>
    </v-toolbar>

    <v-container fluid grid-list-lg class="grey lighten-4">
      <v-layout row wrap>
        <v-flex xs6 sm3 md2 lg2 v-for="textbook in textbooks" :key="textbook.title">
          <v-card>
            <v-card-media height="200px"></v-card-media>
            <v-card-title primary-title>{{ textbook.title }}</v-card-title>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>

    <p v-if="errorMessage">{{errorMessage}}</p>
  </div>
</template>

<script>
import firebase from 'firebase'

export default {
  
  name: 'Dashboard',
  data () {
    return {
      textbooks: [],
      errorMessage: ''
    }
  },
  methods: {
    logout: function() {
      firebase.auth().signOut().then(() => {
        this.$router.replace('login')
      })
    }
  },
  beforeCreate: function() {
    // Reads the textbooks from the database and populates the textbooks array
    let self = this;
    firebase.database().ref('/textbooks').once('value')
    .then(function(textbooks) {
      if (textbooks.exists()) {
        textbooks.forEach(function(textbook) {
          self.textbooks.push(textbook.val());
        })
      }
    })
    .catch(function(error) {
      var errorCode = error.code;
      var errorMessage = error.message;
      self.errorMessage = errorMessage;
    })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
button {
  padding: 10px 20px;
  background: #42b983;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 22px;
  outline: 0;
  cursor: pointer;
}
</style>
