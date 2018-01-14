<template>
  <div class="dashboard">
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
  </div>
</template>

<script>
import firebase from 'firebase'
import pdfjs from 'pdfjs-dist'

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
      let self = this;
      firebase.auth().signOut().then(function() {
        self.$router.replace('login');
      });
    },
    download: function() {
      var storage = firebase.storage();
      var pathReference = storage.ref('textbooks/CSC 444 Project --- Marketplace.pdf');

      //pdfjs.PDFJS.workerSrc = '/../node_modules/pdfjs-dist/build/pdf.worker.entry.js';
      pdfjs.PDFJS.workerSrc = '../../build/webpack/pdf.worker.entry.js';

      var SEARCH_FOR = ''; // try 'Mozilla';

      var container = document.getElementById('viewerContainer');

      // (Optionally) enable hyperlinks within PDF files.

      var pdfViewer = new pdfjs.PDFViewer({
        container: container
      });

      // (Optionally) enable find controller.
      var pdfFindController = new pdfjs.PDFFindController({
        pdfViewer: pdfViewer
      });
      pdfViewer.setFindController(pdfFindController);

      container.addEventListener('pagesinit', function () {
        // We can use pdfViewer now, e.g. let's change default scale.
        pdfViewer.currentScaleValue = 'page-width';

        if (SEARCH_FOR) { // We can try search for things
          pdfFindController.executeCommand('find', {query: SEARCH_FOR});
        }
      });

      // Loading document.
      pathReference.getDownloadURL().then(function(url) {
        pdfjs.getDocument(url).then(function (pdfDocument) {
          // Document loaded, specifying document for the viewer and
          // the (optional) linkService.
          pdfViewer.setDocument(pdfDocument);
        });
      });

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
