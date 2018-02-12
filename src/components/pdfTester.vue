<template>
  <v-container fill-height fluid id="pdfViewer">
    <v-layout row wrap align-center>
      <v-flex xs12 class="tools">
          <div class="pageShift">
            <span v-on:click="prevPage"><v-icon>fa-chevron-left</v-icon></span>
            <span v-on:click="nextPage"><v-icon>fa-chevron-right</v-icon></span>
          </div>
          <div class="pageNumber">
            <span>Page {{page}} of {{numPages}}</span>
          </div>
          <div class="icons">
            <v-icon small v-on:click="rotate -= 90">fa-rotate-left</v-icon>
            <v-icon small v-on:click="rotate += 90">fa-rotate-right</v-icon>
            <v-icon small v-on:click="$refs.pdf.print()">fa-print</v-icon>
          </div>
        </v-flex>
      </v-flex>
      <v-flex xs12 sm10 offset-sm1>
      <clip-loader :loading="!src" :color="'#7c7c7c'" :size="size"></clip-loader>
      <pdf ref="pdf" :src="src" :page="page" :rotate="rotate" @password="password" @progress="loadedRatio = $event" @error="error" @num-pages="numPages = $event"></pdf>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
import firebase from 'firebase'
import pdf from 'vue-pdf'
import ClipLoader from 'vue-spinner/src/ClipLoader.vue'

export default {
  name: 'pdfTester',
  components: {
    pdf: pdf,
    ClipLoader
  },
  data () {
    return {
      pdfList: [
        '',
        'https://cdn.mozilla.net/pdfjs/tracemonkey.pdf',
        'https://cdn.rawgit.com/mozilla/pdf.js/c6e8ca86/test/pdfs/freeculture.pdf',
        'https://cdn.rawgit.com/mozilla/pdf.js/c6e8ca86/test/pdfs/annotation-link-text-popup.pdf',
        'https://cdn.rawgit.com/mozilla/pdf.js/c6e8ca86/test/pdfs/calrgb.pdf',
        'https://cdn.rawgit.com/sayanee/angularjs-pdf/68066e85/example/pdf/relativity.protected.pdf',
        'data:application/pdf;base64,JVBERi0xLjUKJbXtrvsKMyAwIG9iago8PCAvTGVuZ3RoIDQgMCBSCiAgIC9GaWx0ZXIgL0ZsYXRlRGVjb2RlCj4+CnN0cmVhbQp4nE2NuwoCQQxF+/mK+wMbk5lkHl+wIFislmIhPhYEi10Lf9/MVgZCAufmZAkMppJ6+ZLUuFWsM3ZXxvzpFNaMYjEriqpCtbZSBOsDzw0zjqPHZYtTrEmz4eto7/0K54t7GfegOGCBbBdDH3+y2zsMsVERc9SoRkXORqKGJupS6/9OmMIUfgypJL4KZW5kc3RyZWFtCmVuZG9iago0IDAgb2JqCiAgIDEzOAplbmRvYmoKMiAwIG9iago8PAogICAvRXh0R1N0YXRlIDw8CiAgICAgIC9hMCA8PCAvQ0EgMC42MTE5ODcgL2NhIDAuNjExOTg3ID4+CiAgICAgIC9hMSA8PCAvQ0EgMSAvY2EgMSA+PgogICA+Pgo+PgplbmRvYmoKNSAwIG9iago8PCAvVHlwZSAvUGFnZQogICAvUGFyZW50IDEgMCBSCiAgIC9NZWRpYUJveCBbIDAgMCA1OTUuMjc1NTc0IDg0MS44ODk3NzEgXQogICAvQ29udGVudHMgMyAwIFIKICAgL0dyb3VwIDw8CiAgICAgIC9UeXBlIC9Hcm91cAogICAgICAvUyAvVHJhbnNwYXJlbmN5CiAgICAgIC9DUyAvRGV2aWNlUkdCCiAgID4+CiAgIC9SZXNvdXJjZXMgMiAwIFIKPj4KZW5kb2JqCjEgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzCiAgIC9LaWRzIFsgNSAwIFIgXQogICAvQ291bnQgMQo+PgplbmRvYmoKNiAwIG9iago8PCAvQ3JlYXRvciAoY2Fpcm8gMS4xMS4yIChodHRwOi8vY2Fpcm9ncmFwaGljcy5vcmcpKQogICAvUHJvZHVjZXIgKGNhaXJvIDEuMTEuMiAoaHR0cDovL2NhaXJvZ3JhcGhpY3Mub3JnKSkKPj4KZW5kb2JqCjcgMCBvYmoKPDwgL1R5cGUgL0NhdGFsb2cKICAgL1BhZ2VzIDEgMCBSCj4+CmVuZG9iagp4cmVmCjAgOAowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDA1ODAgMDAwMDAgbiAKMDAwMDAwMDI1MiAwMDAwMCBuIAowMDAwMDAwMDE1IDAwMDAwIG4gCjAwMDAwMDAyMzAgMDAwMDAgbiAKMDAwMDAwMDM2NiAwMDAwMCBuIAowMDAwMDAwNjQ1IDAwMDAwIG4gCjAwMDAwMDA3NzIgMDAwMDAgbiAKdHJhaWxlcgo8PCAvU2l6ZSA4CiAgIC9Sb290IDcgMCBSCiAgIC9JbmZvIDYgMCBSCj4+CnN0YXJ0eHJlZgo4MjQKJSVFT0YK',
      ],
      src:'',
      loadedRatio: 0,
      page: 1,
      numPages: 0,
      rotate: 0,
      textbook: {}
    }
  },
  methods: {
    prevPage: function() {
      if (this.page > 1)
        this.page -= 1;
    },
    nextPage: function() {
      if (this.page < this.numPages)
        this.page += 1;
    },
  },
  created: function() {
    // Reads the textbooks from the database and populates the textbooks array
    let self = this;
    firebase.database().ref('/textbooks/' + this.$route.params.textbookId).once('value')
    .then(function(textbook) {
      if (textbook.exists()) {
          let textbookData = textbook.val();
          let storage = firebase.storage();
          let pathRef = storage.ref("textbooks/" + textbookData.url);

          console.log(pathRef);

          pathRef.getDownloadURL().then(function(url) {
            self.src = url;
            console.log(self.src);
          });
      }
    })
    .catch(function(error) {
      console.log(error);
    });
  }
}
</script>

<style scoped>
  
  #pdfViewer {
    padding: 0;
  }

  #pdfViewer .tools {
    background: #F2F1EF;
    padding: 10px 20px;
    margin-bottom: 10px;
    position: -webkit-sticky;
    position: sticky;
    top: -1px;
    z-index: 4;
  }

  #pdfViewer .tools > * {
    display: inline-block;
  }

  #pdfViewer .tools .pageShift {
    width: 33%;
  }

  #pdfViewer .tools .pageShift span {
    background: #ABB7B7;
    color: #FFF;
    font-size: .9rem;
    padding: 6px 14px;
    border-radius: 4px;
    cursor: pointer;
  }

  #pdfViewer .tools .pageShift span i {
    color: #FFF;
    font-size: .9rem;
  }

  #pdfViewer .tools .pageNumber {
    width: 33%;
    text-align: center;
  }

  #pdfViewer .tools .icons {
    width: 33%;
    text-align: right;
  }

  #pdfViewer .tools .icons i {
    font-size: 1.6rem;
    margin-left: 10px;
    cursor: pointer;
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