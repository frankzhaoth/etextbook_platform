<template>
  <div id="dashboard">
    <v-container grid-list-lg>
      <v-layout row wrap>
        <v-flex xs12>
          <h2>Textbook Collection</h2>
          <hr/>
        </v-flex>
        <v-flex xs6 sm3 md2 lg2 v-for="textbook in textbooks" :key="textbook.key">
          <v-card>
            <v-card-media v-on:click="clickTextbook(textbook.key)" :src="textbook.cover" height="200px"></v-card-media>
            <v-card-title>{{ textbook.title }}</v-card-title>
            <v-card-actions>
                <v-icon v-on:click="toggleFavourite(textbook.key)" class="mr-2 ml-2">fa-star-o</v-icon>
                <v-icon v-on:click="viewTextbook(textbook.key)" class="mr-2 ml-2">fa-eye</v-icon>
            </v-card-actions>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
import firebase from 'firebase'

export default {
  
  name: 'Dashboard',
  data () {
    return {
      textbooks: [],
      favourites: []
    }
  },
  methods: {
    logout: function() {
      let self = this;
      firebase.auth().signOut().then(function() {
        self.$router.replace('login');
      });
    },

    clickTextbook: function(key) {
      this.$router.push('/textbook/' + key);
    },
    
    viewTextbook: function(key) {
      this.$router.push('/textbook/' + key + "/view");
    },   

    toggleFavourite: function(_key) {
      let currentUser = firebase.auth().currentUser.uid;

      // Remove as favourite
      if (this.favourites.indexOf(_key) > -1) {
        this.favourites.splice(this.favourites.indexOf(_key), 1);
        firebase.database().ref('/users/' + currentUser + '/favourites/').set(this.favourites);
      }
      // Set as favourite
      else {
        this.favourites.push(_key);
        firebase.database().ref('/users/' + currentUser + '/favourites/').set(this.favourites);
      }
    },

  },
    
  created: function() {
    // Reads the textbooks from the database and populates the textbooks array
    let self = this;
    let currentUser = firebase.auth().currentUser.uid;
    
    firebase.database().ref('/users/' + currentUser + '/favourites/').once('value')
    .then(function(favourites) {
      if (favourites.exists()) {
        favourites.forEach(function(favourite) {
          self.favourites.push(favourite.val());
        })
      }
      console.log(self.favourites);
    });

    firebase.database().ref('/textbooks').once('value')
    .then(function(textbooks) {
      if (textbooks.exists()) {
        textbooks.forEach(function(textbook) {
          let textbookData = textbook.val();
          textbookData.key = textbook.key;
          let coverRef = firebase.storage().ref('textbooks/covers/' + textbookData.cover);
          coverRef.getDownloadURL().then(function(url) {
            textbookData.cover = url;
            self.textbooks.push(textbookData);
          });
        });
      }
      console.log(self.textbooks);
    })
    .catch(function(error) {
      console.log(error);
    });
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

  #dashboard {
    min-height: calc(100vh - 105px);
    background: #f5f5f5;
  }

  #dashboard h2 {
    margin-bottom: 0;
    margin-top: 20px;
    font-weight: 400;
  }

  #dashboard .card i {
    cursor: pointer;
  }

  #dashboard .card i:hover {
    color: #1976D2;
  }

  #dashboard .loader {
    color: #666;
    text-align: center;
  }

</style>
