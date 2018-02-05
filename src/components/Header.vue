<template>
  <v-toolbar flat style="background: #9A3658;" >
    <v-toolbar-title style="line-height: 64px;"><img id="logo" src="static/logo_white.png" /></v-toolbar-title>
    <v-spacer></v-spacer>
    <p class="white--text" style="line-height: 64px; margin: 0; font-weight: 400;">{{name}}</p>
    <v-menu>
      <v-btn flat color="white" icon slot="activator">
        <v-icon small>fa-caret-down</v-icon>
      </v-btn>
      <v-card>
        <v-card-title class="align-start">
          <v-btn large color="blue lighten-1" class="ml-0" icon disabled>
            <p alt="avatar" class="avatar white--text">{{getInitial}}</p>
          </v-btn>
          <div>
            <p class="name">{{name}}</p>
            <p class="mb-0 grey--text lighten-2 email">{{email}}</p>
            <v-btn v-on:click="logout" class="ml-0" color="red lighten-1 white--text">Logout</v-btn>
          </div>
        </v-card-title>
      </v-card>
    </v-menu>

    <!--<v-btn flat color="red lighten-1" v-on:click="logout">Logout</v-btn>-->

  </v-toolbar>
</template>

<script>

import firebase from 'firebase'
import 'font-awesome/css/font-awesome.css'

export default {
  name: 'Header',
  data: function() {
    return {
      name: '',
      email: firebase.auth().currentUser.email
    }
  },
  methods: {
    logout: function() {
      let self = this;
      firebase.auth().signOut().then(function() {
        self.$router.replace('/login');
      });
    }
  },
  computed: {
    getInitial: function() {
      return this.name.split(" ")[0][0];
    }
  },
  created: function(){
    // Fetching the name from Firebase and setting in the data
    let currentUser = firebase.auth().currentUser.uid;
    let self = this;
    firebase.database().ref('/users/' + currentUser).once('value').then(function(user) {
      self.name = user.val().name;
    });
  }
}
</script>

<style scoped>
  #logo {
    height: 40px;
    vertical-align: middle;
  }
  .avatar {
    text-align: center;
    margin: 0;
    font-weight: 400;
  }
  .name {
    font-size: 1.2rem;
    font-weight: 300;
    margin: 0;
  }
  .email {
    font-size: .9rem;
  }
</style>