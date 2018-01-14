<template>
  <v-app id="app">
    <Header v-if="loggedIn"></Header>
    <router-view/>
  </v-app>
</template>

<script>

import Header from './components/Header'
import firebase from 'firebase'

export default {
  name: 'app',
  computed: {
    loggedIn: function() {
      return firebase.auth().currentUser;
    }
  },
  components: {
      'Header': Header
  }
}
</script>