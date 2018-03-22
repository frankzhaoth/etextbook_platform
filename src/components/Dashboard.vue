<template>
  <div id="dashboard">
    <v-container grid-list-lg>
      <v-layout row wrap>
        <v-flex xs12>
          <v-card-text>
            <v-text-field v-model="searchbookname" placeholder="search Textbook by name" ></v-text-field>
          </v-card-text>
        </v-flex>
        <v-flex xs12 v-if="Object.keys(this.favourites).length > 0">
          <h2>My Favourites</h2>
          <hr/>
        </v-flex>
        <v-flex xs6 sm3 md2 lg2 v-for="favourite in favourites">
          <v-card>
            <v-card-media v-on:click="clickTextbook(favourite.key)" :src="favourite.cover" height="200px"></v-card-media>
            <v-card-title>{{favourite.title}}</v-card-title>
            <v-card-actions>
                <v-icon v-on:click="toggleFavourite(favourite.key)" class="mr-2 ml-2" style="color: #1976D2;">fa-star</v-icon>
                <v-icon v-on:click="viewTextbook(favourite.key)" class="mr-2 ml-2">fa-eye</v-icon>
            </v-card-actions>
          </v-card>
        </v-flex>

        <v-flex xs12>
          <h2>Textbook Collection</h2>
          <hr/>
        </v-flex>
        <v-flex xs6 sm3 md2 lg2 v-for="textbook in filteredBook" :key="textbook.key">
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
      searchbookname: '',
      textbooks: [],
      favourites: {}
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

    getTextbook: function(key) {
      for (var index in this.textbooks) {
        if (this.textbooks[index].key === key)
          return this.textbooks[index];
      }
    },

    toggleFavourite: function(_key) {
      let currentUser = firebase.auth().currentUser.uid;

      // Remove as favourite
      if (_key in this.favourites) {
        this.$delete(this.favourites, _key);
        firebase.database().ref('/users/' + currentUser + '/favourites/').set(this.favourites);
      }
      // Set as favourite
      else {
        for (var index in this.textbooks) {
          if (this.textbooks[index].key === _key) {
            this.$set(this.favourites, _key, this.textbooks[index]);
          }
        }
        firebase.database().ref('/users/' + currentUser + '/favourites/').set(this.favourites);
      }
    },

  },

  computed:{
    filteredBook:function(){
      return this.textbooks.filter((textbook) => {
        return textbook.title.match(this.searchbookname);
      });
    }
  },

  created: function() {
    // Reads the textbooks from the database and populates the textbooks array
    let self = this;
    let currentUser = firebase.auth().currentUser.uid;

    firebase.database().ref('/users/' + currentUser + '/favourites/').once('value')
    .then(function(favourites) {
      if (favourites.exists()) {
        favourites.forEach(function(favourite) {
          self.$set(self.favourites, favourite.val().key, favourite.val());
        })
      }
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
