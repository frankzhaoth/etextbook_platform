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
            <v-icon small v-on:click="logContent">fa-pencil</v-icon>
          </div>
        </v-flex>
      </v-flex>
      <v-flex xs2 sm2 id="notes">
        <p class="subheading">Notes - Page {{page}}</p>
        <span>
          <v-tooltip bottom>
            <v-icon slot="activator" @click="toggleShare">fa-share</v-icon>
            <span>Share</span>
          </v-tooltip>
          <v-flex xs8 v-if="addFriend">
              <v-text-field @keyup.enter="shareNote(note)" v-model="friend" label="Friend's email"  clearable></v-text-field>
            </v-flex>
        </span>
        <v-divider></v-divider>
        <v-select
          :items="['All', 'Me', 'Anmol Singh']"
          label="Filter by author"
          single-line
          dense
          bottom
        ></v-select>

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

            
            <v-card-title>
              <p v-html="getAnchormeText(note.text)"></p>
            </v-card-title>
            <span class="author">Created by: Anmol Singh</span>
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
    logContent: function() {
      let self = this;
      console.log(this.$refs.pdf.pdf.getCurrentPage());

      this.$refs.pdf.pdf.getCurrentPage().getTextContent().then(function(content) {
          var text = content.items.map(item => item.str);
          console.log(text);
        })
      //this.$refs.pdf.pdf.forEachPage(function(page) {
      //  console.log(page);
      //});
      //this.$refs.pdf.getPage(self.page).then(function(page) {
      //  console.log(page)
      //});
      //this.$refs.pdf.pdf.forEachPage(function(page) {
      //  return page.getTextContent().then(function(content) {
      //    var text = content.items.map(item => item.str);
      //    console.log(page);
      //  })
      //});
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
      let name, email;
      let isFriend = false;
      firebase.database().ref('/users/' + currentUser).once('value')
      .then(function(snapshot) {
        let val = snapshot.val();
        name =  val.name;
        email = val.email;
        if (val.friends.friend == self.friend)
          isFriend = true;
      });
      if (!isFriend)
      {
        firebase.database().ref('/users/' + currentUser + '/friends/')
        .set({
          'friend' : self.friend
        });

        
        firebase.database().ref('/users/').once('value', function(snapshot) {

          snapshot.forEach(function(childSnapshot) {
            var childKey = childSnapshot.key;
            var childData = childSnapshot.val();

        console.log("--- " + childData + " ---");
        console.log("--- " + childSnapshot.val() + " ---");
        // this returns empty object, although it shouldn't [Object object]
            // ...
            if(self.friend == childData.email){
              console.log("Friend email: " + self.friend);
              console.log("childData: " + childData.email);
              // friend's email matches, add the required data
              firebase.database().ref('/users/' + childKey + '/friends/')
              .set({
                'friend': email
              });
            }
          });
        });
      }
      self.friend = '';


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

  #pdfViewer #notes > .menu button {
    width: 24px;
    height: 24px;
    margin: 0;
  }

  #pdfViewer #notes > .menu button i {
    font-size: 16px;
  }

  #pdfViewer #notes > span {
    font-size: .9rem;
  }

  #pdfViewer #notes > span i {
    font-size: .9rem;
    cursor: pointer;
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

  #pdfViewer #notes .card span.author {
    position: absolute;
    bottom: 2px;
    right: 2px;
    font-size: 8px;
    color: #555;
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