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
      <v-flex xs2 sm2 id="sidebar">

        <v-flex xs12 class="text-xs-center">
            <v-chip :selected="sidebarMode === 'notes'" :outline="sidebarMode !== 'notes'" :class="{ lowOpacity: sidebarMode !== 'notes' }" color="blue darken-2" class="white--text" @click="toggleSidebarMode()">Notes</v-chip>
            <v-chip :selected="sidebarMode === 'questions'" :outline="sidebarMode !== 'questions'" :class="{ lowOpacity: sidebarMode !== 'questions' }" color="blue darken-2" class="white--text" @click="toggleSidebarMode()">Questions</v-chip>
        </v-flex>

        <v-flex xs12 id="questions" v-if="sidebarMode === 'questions'">

          <p class="subheading">Questions
            <v-btn color="primary" small @click="newQuestion()" flat>New Question</v-btn>
          </p>
          <v-divider></v-divider>

          <v-list two-line v-if="questionsArray.length != 0">
            <template v-for="(question, index) in questionsArray">
              <v-list-tile
                avatar
                ripple
                @click="clickQuestion(index)"
                :key="question.qId"
              >
                <v-list-tile-content>
                  <v-list-tile-title>{{ question.question }}</v-list-tile-title>
                  <v-list-tile-sub-title>{{ question.userName }}</v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
              <v-divider v-if="index + 1 < questionsArray.length" :key="index"></v-divider>
            </template>
          </v-list>

          <v-dialog v-model="questionDialog" max-width="500px">
            <new-question :page-prop="page" @clicked="onClickChild"></new-question>
          </v-dialog>

          <v-dialog v-model="selectedQuestionDialog" max-width="600px">
            
            <v-container fluid>
              <v-card>
                <v-layout>
                  <v-flex>
                    <v-card-title primary-title>
                      <h5 class="title">{{ selectedQuestion.question }}</h5>
                    </v-card-title>
                    <v-divider></v-divider>
                    <v-card-text>
                      <h6 v-html="selectedQuestion.body" class="subheading"></h6>
                    </v-card-text>
                  </v-flex>
                </v-layout>
                <v-layout>
                  <v-flex>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <h6 class="caption ml-0">{{ selectedQuestion.userName }},</h6>
                      <h6 class="caption ml-0">{{ getRelativeTime(selectedQuestion.date) }}</h6>
                    </v-card-actions>
                  </v-flex>
                </v-layout>
                
                <v-layout v-if="bestAnswer == null">
                  <v-subheader>
                    <v-flex>
                      <h6 class="subheading">There are no good answers, go to the forum to see all the answers or
                        better yet, answer it yourself.
                      </h6>
                    </v-flex>
                  </v-subheader>
                </v-layout>

                 <v-layout v-if="bestAnswer != null">
                  <v-subheader>
                    <v-flex>
                      <h6 class="title">Best Answer</h6>
                    </v-flex>
                  </v-subheader>
                </v-layout>

                <v-layout v-if="bestAnswer != null">
                  <v-flex>
                    <v-card-title class="py-2 px-3">
                      <h3>{{bestAnswer.userName}}</h3>
                      <v-spacer></v-spacer>
                      <h6 class="caption grey--text text--darken-1">{{ getRelativeTime(bestAnswer.date) }}</h6>
                    </v-card-title>
                    <v-divider></v-divider>
                    <v-card-text>
                      <h6 v-html="bestAnswer.answer" class="subheading ml-0"></h6>
                    </v-card-text>
                  </v-flex>
                </v-layout>
                <v-layout>
                  <v-flex>
                    <v-card-actions>
                      <h6 class="caption ml-3" v-if="bestAnswer != null">Upvotes: {{ bestAnswer.voteScore }}</h6>
                      <v-icon small color="green darken-1" v-if="bestAnswer != null && bestAnswer.accepted === true"
                      >fas fa-check</v-icon>
                      <v-spacer></v-spacer>
                      <v-btn flat color="primary" @click="goToForum">Forum</v-btn>
                    </v-card-actions>
                  </v-flex>
                </v-layout>

              </v-card>
            </v-container>

          </v-dialog>

        </v-flex>

        <v-flex xs12 id="notes" v-if="sidebarMode === 'notes'">
        <p class="subheading">Notes <span v-if="noteViewMode === 'page'" class="grey--text text--darken-1" @click="toggleNotesMode()">View All</span><span v-if="noteViewMode === 'all'" class="grey--text text--darken-1" @click="toggleNotesMode()">View page</span></p>
        <span>
          <v-tooltip bottom>
            <v-icon slot="activator" @click="">fa-share</v-icon>
            <span>Share</span>
          </v-tooltip>
        </span>
        <v-divider></v-divider>
        <!--<v-select
          :items="['All', 'Me', 'Anmol Singh']"
          label="Filter by author"
          single-line
          dense
          bottom
        ></v-select>-->

        <v-flex xs12>
          <v-card class="new mb-4" v-bind:style="{ backgroundColor: '#' + selectedColour}">
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

          <!-- All notes start here -->
          <div v-if="noteViewMode === 'all'" class="allnotes" v-for="(note, key) in notes">
            <v-subheader class="pl-0" :key="key">Page {{key}}</v-subheader>
            <v-divider></v-divider>
            <v-card v-for="(noteInfo, noteKey) in note" v-bind:style="{ backgroundColor: '#' + noteInfo.colour}">
              <v-icon v-on:click="deleteNote(noteKey)">fa-trash</v-icon>
              <v-icon @click="toggleShare"  class="shareF" small right color="blue darken-4">chat</v-icon>

              <v-flex xs8 v-if="addFriend">
                <v-text-field @keyup.enter="shareNote(note)" v-model="friend" label="Friend's email"  clearable></v-text-field>
              </v-flex>
              <v-card-title>
                <p>{{noteInfo.text}}</p>
              </v-card-title>
              <span class="author">Add author name here</span>
            </v-card>
          </div>
          
          <!--Page notes start here-->
          <v-subheader v-if="noteViewMode === 'page'" class="pl-0">Page {{page}}</v-subheader>
          <v-divider v-if="noteViewMode === 'page'"></v-divider>
          <v-card v-if="noteViewMode === 'page'" v-for="(note, key) in notes"  v-bind:style="{ backgroundColor: '#' + note.colour}">
            <v-icon v-on:click="deleteNote(key)">fa-trash</v-icon>
            <v-icon @click="toggleShare"  class="shareF" small right color="blue darken-4">chat</v-icon>

            <v-flex xs8 v-if="addFriend">
              <v-text-field @keyup.enter="shareNote(note)" v-model="friend" label="Friend's email"  clearable></v-text-field>
            </v-flex>
            <v-card-title>
              <p v-html="getAnchormeText(note.text)"></p>
            </v-card-title>
            <span class="author">Add author name here</span>
          </v-card>
          </v-flex>
        </v-flex>
      </v-flex>
      <v-flex xs10 sm10>
        <clip-loader :loading="!src" :color="'#7c7c7c'" :size="size"></clip-loader>
        <pdf ref="pdf" :src="src" :page="page" :rotate="rotate" @password="password" @progress="loadedRatio = $event" @error="error" @num-pages="numPages = $event"></pdf>
        <div id="text-layer" class="textLayer" @mouseup="textSelection()"></div>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
import firebase from 'firebase'
import pdf from 'vue-pdf'
import ClipLoader from 'vue-spinner/src/ClipLoader.vue'
import anchorme from "anchorme"
import NewQuestion from "./NewQuestion.vue"

var moment = require('moment');

export default {
  name: 'pdfTester',
  components: {
    pdf: pdf,
    ClipLoader,
    'new-question': NewQuestion
  },
  data () {
    return {
      src:'',
      loadedRatio: 0,
      page: 1,
      numPages: 0,
      rotate: 0,
      textbook: {},
      sidebarMode: 'notes',
      newNote: '',
      notes: {},
      noteViewMode: 'page',
      colours: ['FFF9A2', '6FC0F7', 'EAB9EA', 'A5E7F9', 'D9F9A5'],
      selectedColour: 'FFF9A2',
      friend: '',
      addFriend: false,
      questionDialog: false,
      questionsArray: [],
      selectedQuestion: '',
      bestAnswer: '',
      selectedQuestionDialog: false
    }
  },
  methods: {
    textSelection: function() {
      console.log(window.getSelection().toString(), this);
    },
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

      console.log(this.$refs.pdf.pdf.createTextLayer(this.rotate, this.$refs.pdf.$refs.canvas));

      // Log page text
      /*
      this.$refs.pdf.pdf.getCurrentPage().getTextContent().then(function(content) {
        var text = content.items.map(item => item.str);
        console.log(text);
        var textLayer = new TextLayerBuilder({
          textLayerDiv : $textLayerDiv.get(0),
          pageIndex : page_num - 1,
          viewport : viewport
        });

        textLayer.setTextContent(textContent);
        textLayer.render();
      });
      */


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
    toggleSidebarMode: function() {
      if (this.sidebarMode === 'notes')
        this.sidebarMode = 'questions';
      else
        this.sidebarMode = 'notes';
    },
    toggleNotesMode: function() {
      let currentUser = firebase.auth().currentUser.uid;
      let self = this;
      
      if (this.noteViewMode === 'page') {
        this.noteViewMode = 'all';
        // Get ALL notes from firebase for current user
        let ref = firebase.database().ref('/users/' + currentUser + '/notes/' + this.$route.params.textbookId);
        ref.on("value", function(snapshot) {
          self.notes = snapshot.val();
          //let keys = Object.keys(snapshot.val());
          //console.log(snapshot.val()[keys[0]]);
        }, 
        function (errorObject) {
          console.log(error);
        });
      }

      else {
        this.noteViewMode = 'page';
        // Get notes for current page from firebase
        let ref = firebase.database().ref('/users/' + currentUser + '/notes/' + this.$route.params.textbookId + '/' + this.page);
        ref.on("value", function(snapshot) {
          self.notes = snapshot.val();
        }, 
        function (errorObject) {
          console.log(error);
        });
      }
    },

    newQuestion: function() {
      this.questionDialog = true;
    },

    onClickChild: function() {
      // This is called when the user hits the submit button when asking a new question
      this.questionDialog = false;
    },

    getQuestionsOnPage: function() {
      let self = this;
      let textbookId = self.$route.params.textbookId;

      // Clear the questionsArray
      self.questionsArray = [];

      let qRef = firebase.database().ref('/forum/' + textbookId);

      qRef.orderByChild("page").equalTo(self.page).on("value", function(questions) {
        if (questions.exists()) {

          // Clear the questionsArray
          self.questionsArray = [];

          questions.forEach(function(question) {
            let questionData = question.val();
            let questionKey = question.key;
            
            self.questionsArray.push({
              'question': questionData.question,
              'body': questionData.body,
              'userName': questionData.userName,
              'userId': questionData.userId,
              'qId': questionKey,
              'accepted': questionData.accepted,
              'date': moment(questionData.date).local().format("dddd, MMMM Do YYYY, h:mm:ss a"),
              'answers': questionData.answers
            });
          });   
        }
      });
    },

    getRelativeTime: function(time) {
      return moment(time, "dddd, MMMM Do YYYY, h:mm:ss a").fromNow();
    },

    clickQuestion: function(index) {
      let question = this.questionsArray[index];
      let answers = question.answers;

      // Save the selected question 
      this.selectedQuestion = question;

      // Look for the best answer 
      if (answers != null) {
        
        // The best answer is considered the accepted answer
        if (answers[question.accepted] != null) {

            // Get the answer and the answer votes
            let answer = answers[question.accepted];
            let answerVotes = answer.votes;

            // Calculate the upvotes 
            let voteScore = 0;
            if (answerVotes != null) {
              Object.keys(answerVotes).forEach(function(voteKey) {
                voteScore += answerVotes[voteKey].vote;
              });
            }

            answer['voteScore'] = voteScore;
            answer['accepted'] = true;
            answer['date'] = moment(answer.date).local().format("dddd, MMMM Do YYYY, h:mm:ss a");

            this.bestAnswer = answer;
        }

        // If it doesn't exist, pick the highest voted answer (>0)
        else {
          let questionAnswers = [];
          Object.keys(answers).forEach(function(answerKey) {

            // Get the answer and the answer votes
            let answer = answers[answerKey];
            let answerVotes = answer.votes;

            // Calculate the upvotes 
            let voteScore = 0;
            if (answerVotes != null) {
              Object.keys(answerVotes).forEach(function(voteKey) {
                voteScore += answerVotes[voteKey].vote;
              });
            }

            answer['voteScore'] = voteScore;
            answer['date'] = moment(answer.date).local().format("dddd, MMMM Do YYYY, h:mm:ss a");
            questionAnswers.push(answer);
          });

          // Find the most upvoted answer
          let result = Math.max.apply(Math, questionAnswers.map(function(answer){ return answer.voteScore; }));

          // If the most upvoted answer is more than 0, then show it to the user
          if (result > 0) {
            this.bestAnswer = questionAnswers.find(function(answer){ return answer.voteScore === result; });
          } else {
            this.bestAnswer = null;
          }
        }
      } else {
        this.bestAnswer = null;
      }

      this.selectedQuestionDialog = true;
    },

    goToForum: function() {
      if (this.selectedQuestion.qId != null) {
        this.$router.push('/textbook/' + this.$route.params.textbookId + '/forum/' + this.selectedQuestion.qId);
      }
    }
  },
  watch: {
    // whenever question changes, this function will run
    page: function (newPage, oldPage) {
      if (this.noteViewMode === 'page') {
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
      }

      this.getQuestionsOnPage();
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

    // Get the questions from the database for the current page
    self.getQuestionsOnPage();
  },

  beforeDestroy: function() {
    let textbookId = this.$route.params.textbookId;

    let qRef = firebase.database().ref('/forum/' + textbookId);
    qRef.off();
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

  #pdfViewer .lowOpacity {
    opacity: .6;
  }

  #pdfViewer .chip, #pdfViewer .chip .chip__content {
    cursor: pointer;
  }

  #pdfViewer .textLayer {
    overflow: hidden;
    opacity: 0.2;
    line-height: 1.0;
  }

  #pdfViewer .textLayer ::selection {
    background: #FFF9A2;
  }

  #pdfViewer .textLayer >>> div {
    color: transparent;
    position: absolute;
    white-space: pre;
    cursor: text;
    -webkit-transform-origin: 0% 0%;
    -moz-transform-origin: 0% 0%;
    -o-transform-origin: 0% 0%;
    -ms-transform-origin: 0% 0%;
    transform-origin: 0% 0%;
  }

  #pdfViewer #sidebar {
    background: #EFEFEF;
    padding: 5px 10px;
    border-right: 1px solid #ABB7B7;
  }

  #pdfViewer #notes, #pdfViewer #questions {
    overflow-y: scroll;
    margin-top: 10px;
  }

  #pdfViewer #notes > p.subheading {
    margin-bottom: 5px;
    width: calc(100% - 20px);
    display: inline-block;
  }

  #pdfViewer #notes > p.subheading span {
    font-size: .8rem;
    cursor: pointer;
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

  #pdfViewer #notes .allnotes .subheading {
    padding-left: 0;
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