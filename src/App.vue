<template>
  <v-app id="app">
    <Header v-if="loggedIn"></Header>
    <router-view/>
    <Footer></Footer>
  </v-app>
</template>

<script>

import Header from './components/Header'
import Footer from './components/Footer'
import firebase from 'firebase'

export default {
  name: 'app',
  computed: {
    loggedIn: function() {
      return firebase.auth().currentUser;
    }
  },
  components: {
      'Header': Header,
      'Footer': Footer
  }
}
</script>