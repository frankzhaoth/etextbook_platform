<template>
  <div class="dashboard">
    <h1>{{ msg }}</h1>
    <h2>Essential Links</h2>
    <p v-on:click="download">File Download</p>
    <div id="viewerContainer">
      <div id="viewer" class="pdfViewer"></div>
    </div>
    <ul>
      <li><a href="https://vuejs.org" target="_blank">Core Docs</a></li>
      <li><a href="https://forum.vuejs.org" target="_blank">Forum</a></li>
      <li><a href="https://chat.vuejs.org" target="_blank">Community Chat</a></li>
      <li><a href="https://twitter.com/vuejs" target="_blank">Twitter</a></li>
      <br>
      <li><a href="http://vuejs-templates.github.io/webpack/" target="_blank">Docs for This Template</a></li>
    </ul>
    <h2>Ecosystem</h2>
    <ul>
      <li><a href="http://router.vuejs.org/" target="_blank">vue-router</a></li>
      <li><a href="http://vuex.vuejs.org/" target="_blank">vuex</a></li>
      <li><a href="http://vue-loader.vuejs.org/" target="_blank">vue-loader</a></li>
      <li><a href="https://github.com/vuejs/awesome-vue" target="_blank">awesome-vue</a></li>
    </ul>
    <button v-on:click="logout">Logout</button>
  </div>
</template>

<script>
import firebase from 'firebase'
import pdfjs from 'pdfjs-dist'

export default {
  
  name: 'Dashboard',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App'
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
