<template>
  <div id="dashboard">
    <v-container grid-list-lg>
      <v-layout row wrap>
        <v-flex xs12>
          <v-btn color="primary" v-on:click="download">Download</v-btn>
        </v-flex>
        <v-flex xs12>
          <div id="viewerContainer" style="width: 100%; height: 200px;">
          </div>
        </v-flex>
        <v-flex xs12>
          <h2>Textbook Collection</h2>
          <hr/>
        </v-flex>
        <v-flex xs6 sm3 md2 lg2 v-for="textbook in textbooks" :key="textbook.key">
          <v-card v-on:click.native="clickTextbook(textbook.key)">
            <v-card-media :src="textbook.cover" height="200px"></v-card-media>
            <v-card-title>{{ textbook.title }}</v-card-title>
            <v-card-actions>
                <v-btn style="margin: 0 auto;" flat color="primary"><v-icon class="mr-2">fa-star-o</v-icon>Favourite</v-btn>
            </v-card-actions>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
import firebase from 'firebase'
import pdfjs from 'pdfjs-dist'

let pdfDocument;
let PAGE_HEIGHT;
const DEFAULT_SCALE = 1.33;

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
    
    download: function() {
      let storage = firebase.storage();
      let pathRef = storage.refFromURL(this.textbooks[1].url);

      let viewer = document.getElementById('viewerContainer');
      let self = this;
      pathRef.getDownloadURL().then(function(url) {
        pdfjs.getDocument(url).then(function (pdf) {

          pdfDocument = pdf;
          
          for (let i = 0; i < pdf.pdfInfo.numPages; i++) {
            let page = self.createEmptyPage(i + 1);
            viewer.appendChild(page);
          }

          self.loadPage(1).then(pdfPage => {
            let viewport = pdfPage.getViewport(DEFAULT_SCALE);
            self.PAGE_HEIGHT = viewport.height;
            document.body.style.width = '${viewport.width}px';
          });

        })
      })
      .catch(function(error) {
        console.log(error);
      });
    },

    createEmptyPage: function(num) {
      let page = document.createElement('div');
      let canvas = document.createElement('canvas');
      let wrapper = document.createElement('div');
      let textLayer = document.createElement('div');

      page.className = 'page';
      wrapper.className = 'canvasWrapper';
      textLayer.className = 'textLayer';

      page.setAttribute('id', `pageContainer${num}`);
      page.setAttribute('data-loaded', 'false');
      page.setAttribute('data-page-number', num);

      canvas.setAttribute('id', `page${num}`);

      page.appendChild(wrapper);
      page.appendChild(textLayer);
      wrapper.appendChild(canvas);

      return page;
    },

    loadPage: function(pageNum) {
      return pdfDocument.getPage(pageNum).then(pdfPage => {
        let page = document.getElementById(`pageContainer${pageNum}`);
        let canvas = page.querySelector('canvas');
        let wrapper = page.querySelector('.canvasWrapper');
        let container = page.querySelector('.textLayer');
        let canvasContext = canvas.getContext('2d');
        let viewport = pdfPage.getViewport(DEFAULT_SCALE);

        canvas.width = viewport.width * 2;
        canvas.height = viewport.height * 2;
        page.style.width = `${viewport.width}px`;
        page.style.height = `${viewport.height}px`;
        wrapper.style.width = `${viewport.width}px`;
        wrapper.style.height = `${viewport.height}px`;
        container.style.width = `${viewport.width}px`;
        container.style.height = `${viewport.height}px`;

        pdfPage.render({
          canvasContext,
          viewport
        });

        pdfPage.getTextContent().then(textContent => {
          PDFJS.renderTextLayer({
            textContent,
            container,
            viewport,
            textDivs: []
          });
        });

        page.setAttribute('data-loaded', 'true');

        return pdfPage;
      });
    },

    clickTextbook: function(key) {
      this.$router.push('/textbook/' + key);
    }
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
    min-height: calc(100vh - 64px);
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
