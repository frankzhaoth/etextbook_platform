<template>
  <div id="dashboard">
    <v-container grid-list-lg>
      <v-layout row wrap>
        <v-flex xs12>
          <h2>Textbook Collection</h2>
          <hr/>
        </v-flex>
        <v-flex xs6 sm3 md2 lg2 v-for="textbook in textbooks" :key="textbook.title">
          <v-card>
            <v-card-media :src="textbook.cover" height="200px"></v-card-media>
            <v-card-title>{{ textbook.title }}</v-card-title>
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
          let textbookData = textbook.val();
          let coverRef = firebase.storage().ref('textbooks/covers/' + textbookData.cover);
          coverRef.getDownloadURL().then(function(url) {
            textbookData.cover = url;
            self.textbooks.push(textbookData);
          });
        });
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

  #dashboard {
    min-height: calc(100vh - 64px);
    background: #f5f5f5;
  }

  #dashboard h2 {
    margin-bottom: 0;
    margin-top: 20px;
    font-weight: 400;
  }

</style>
