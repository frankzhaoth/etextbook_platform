<template>
  <v-container fill-height fluid id="pdfViewer">
    <v-layout row wrap>
      <v-flex xs12 class="tools">
          <div class="pageShift">
            <span v-on:click="prevPage"><v-icon>fa-chevron-left</v-icon></span>
            <span v-on:click="nextPage"><v-icon>fa-chevron-right</v-icon></span>
            <span style="background: none; color: #555;">Jump to:</span>
            <select v-model.number="page">
              <option v-for="pageNum in numPages">{{pageNum}}</option>
            </select>
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
      <v-flex xs2 sm2 id="notes">
        <p class="subheading">Notes - Page {{page}}</p>
        <span>All</span>
        <v-divider></v-divider>
        <v-flex xs12>
          <v-card class="new" v-bind:style="{ backgroundColor: '#' + selectedColour}">
            <v-card-title>
              <textarea @keyup.enter="addNote" v-model="newNote" placeholder="New note..."></textarea>
              <span v-if="newNote" v-on:click="addNote" style="position: absolute; bottom: 10px; right: 16px; color: #313DB2; cursor: pointer;">Add</span>
            </v-card-title>
            <v-card-actions>
              <span v-for="(colour, index) in colours" v-bind:style="{ backgroundColor: '#' + colour}" v-bind:class="{selected: selectedColour === colour}"
              v-on:click="selectedColour = colour"> 
              </span>
            </v-card-actions>
          </v-card>

          <!-- Notes start here -->
          <v-card v-for="(note, key) in notes"  v-bind:style="{ backgroundColor: '#' + note.colour}">
            <v-icon v-on:click="deleteNote(key)">fa-trash</v-icon>
            <v-icon @click="toggleShare"  class="shareF" small right color="blue darken-4">chat</v-icon>

            <v-flex xs8 v-if="addFriend">
              <v-text-field @keyup.enter="shareNote(note)" v-model="friend" label="Friend's email"  clearable></v-text-field>
            </v-flex>
            <v-card-title>
              <p v-html="getAnchormeText(note.text)"></p>
            </v-card-title>
          </v-card>

        </v-flex>
      </v-flex>
      <v-flex xs10 sm10>
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
import anchorme from "anchorme"

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
      textbook: {},
      newNote: '',
      notes: {},
      colours: ['FFF9A2', '6FC0F7', 'EAB9EA', 'A5E7F9', 'D9F9A5'],
      selectedColour: 'FFF9A2',
      friend: '',
      addFriend: false
    }
  },
  methods: {
    getAnchormeText: function(text) {
      return anchorme(text);
    },
    prevPage: function() {
      if (this.page > 1)
        this.page -= 1;
    },
    nextPage: function() {
      if (this.page < this.numPages)
        this.page += 1;
    },
    addNote: function() {
      let currentUser = firebase.auth().currentUser.uid;
      let self = this;

      firebase.database().ref('/users/' + currentUser + '/notes/' + this.$route.params.textbookId + '/' + this.page).push({
        'text': this.newNote,
        'colour': self.selectedColour
      });
      this.newNote = '';
    },
    deleteNote: function(key) {
      let currentUser = firebase.auth().currentUser.uid;
      firebase.database().ref('/users/' + currentUser + '/notes/' + this.$route.params.textbookId + '/' + this.page + '/' + key).remove();
    },
    toggleShare: function() {
      if(this.addFriend == false)
        this.addFriend = true;
      else
        this.addFriend = false;
    },
    shareNote: function(note) {
      let self = this;
      let currentUser = firebase.auth().currentUser.uid;
      let name;
      firebase.database().ref('/users/' + currentUser).once('value')
      .then(function(snapshot) {
        name =  snapshot.val().name;
      });
      firebase.database().ref('/users/')
      .once('value', function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
          var childKey = childSnapshot.key;
          var childData = childSnapshot.val();
          // ...
          if(self.friend == childData.email){
            console.log("Friend email: " + self.friend);
            console.log("childData: " + childData.email);
            // friend's email matches, add the required data
            firebase.database().ref('/users/' + childKey + '/friends/' + currentUser + '/notes/').child(self.$route.params.textbookId + '/' + self.page)
            .push({
              'text': note.text,
              'colour': note.colour,
              'Writer': name
            })
          }
        });
      });

      //self.friend = '';


    },
  },
  watch: {
    // whenever question changes, this function will run
    page: function (newPage, oldPage) {
      // Get notes from firebase
      let currentUser = firebase.auth().currentUser.uid;
      let self = this;

      let ref = firebase.database().ref('/users/' + currentUser + '/notes/' + this.$route.params.textbookId + '/' + this.page);
      ref.on("value", function(snapshot) {
        self.notes = snapshot.val();
      }, 
      function (errorObject) {
        console.log(error);
      });
    },
  },
  created: function() {
    
    let currentUser = firebase.auth().currentUser.uid;
    let self = this;

    // Get notes from firebase
    let ref = firebase.database().ref('/users/' + currentUser + '/notes/' + this.$route.params.textbookId + '/' + this.page);
    ref.on("value", function(snapshot) {
      self.notes = snapshot.val();
    }, 
    function (errorObject) {
      console.log(error);
    });

    // Reads the textbooks from the database and populates the textbooks array
    firebase.database().ref('/textbooks/' + this.$route.params.textbookId).once('value')
    .then(function(textbook) {
      if (textbook.exists()) {
          let textbookData = textbook.val();
          let storage = firebase.storage();
          let pathRef = storage.ref("textbooks/" + textbookData.url);

          //console.log(pathRef);

          pathRef.getDownloadURL().then(function(url) {
            self.src = url;
            //console.log(self.src);
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

  #pdfViewer .tools .pageShift select {
    border: 1px solid #ABB7B7;
    padding: 0px 10px;
    background: #FFF;
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

  #pdfViewer #notes {
    background: #EFEFEF;
    padding: 5px 10px;
    border-right: 1px solid #ABB7B7;
  }

  #pdfViewer #notes > p.subheading {
    margin-bottom: 5px;
    width: calc(100% - 20px);
    display: inline-block;
  }

  #pdfViewer #notes > span {
    font-size: .9rem;
  }

  #pdfViewer #notes .fa-angle-left {
    font-size: 20px;
    display: inline-block;
    cursor: pointer;
    vertical-align: top;
  }

  #pdfViewer #notes .card {
    margin-top: 5px;
  }

  #pdfViewer #notes .card p {
    font-size: .9rem;
    line-height: 130%;
    word-break: break-all;
  }

  #pdfViewer #notes .card i.fa-trash {
    position: absolute;
    font-size: 10px;
    right: 5px;
    top: 5px;
    cursor: pointer;
  }

  #pdfViewer #notes .card.new {
    padding-bottom: 10px;
    background: #f7f7f7;
  }

  #pdfViewer #notes .card.new textarea {
    height: 6rem;
    resize: none;
    font-size: .9rem;
    line-height: 130%;
  }

  #pdfViewer #notes .card.new textarea:focus {
    outline: none;
    border: none;
  }

  #pdfViewer #notes .card.new .card__actions {
    padding-top: 10px;
    padding-bottom: 0;
    border-top: 1px solid #DAD9DB;
  }

  #pdfViewer #notes .card.new .card__actions span {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid #DAD9DB;
    cursor: pointer;
    opacity: .6;
  }

  #pdfViewer #notes .card.new .card__actions span.selected {
    border: 2px solid #777;
    opacity: 1;
  }

  .shareF {
    cursor: pointer;
  }

</style>