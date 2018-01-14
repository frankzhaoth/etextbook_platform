<template>
  <v-toolbar dark color="primary">
    <v-toolbar-title>Dashboard</v-toolbar-title>
    <v-spacer></v-spacer>
    <p style="line-height: 64px; margin: 0; font-weight: 500;">{{username}}</p>
    <v-btn flat v-on:click="logout">Logout</v-btn>
  </v-toolbar>
</template>

<script>

import firebase from 'firebase'

export default {
  name: 'Header',
  data: function() {
    return {
      username: firebase.auth().currentUser.email
    }
  },
  methods: {
    logout: function() {
      let self = this;
      firebase.auth().signOut().then(function() {
        self.$router.replace('login');
      });
    }
  }
}
</script>