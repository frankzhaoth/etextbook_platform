<template>
  <div id="dashboard">
    <v-container grid-list-lg>
      <v-layout row wrap>
        <v-flex xs12>
          <h2>Textbook Collection</h2>
          <hr/>
        </v-flex>
        <v-flex xs6 sm3 md2 lg2 v-for="textbook in textbooks" :key="textbook.key">
          <v-card v-on:click="clickTextbook(textbook.key)">
            <v-card-media :src="textbook.cover" height="200px"></v-card-media>
            <v-card-title>{{ textbook.title }}</v-card-title>
            <v-card-actions>
                <!--<v-btn style="margin: 0 auto;" flat color="primary"><v-icon class="mr-2">fa-star-o</v-icon>Favourite</v-btn>-->
                <v-btn v-on:click="viewTextbook(textbook.key)" style="margin: 0 auto;" color="primary">View</v-btn>
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
  },
    
  created: function() {
    // Reads the textbooks from the database and populates the textbooks array
    let self = this;
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

  #dashboard .loader {
    color: #666;
    text-align: center;
  }

</style>
