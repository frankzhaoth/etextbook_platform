<template>
	<div id="question">

    <v-container fluid>
      <v-card>
        <v-layout>
          <v-flex xs2 sm1 md1 lg1>
            <v-layout align-center column>
              <v-btn flat :color="question.isUpvoted" icon slot="activator" @click="upvoteQuestion">
                <v-icon>thumb_up</v-icon>
              </v-btn>
              <h6 class="subheading">{{ question.voteScore }}</h6>
              <v-btn flat :color="question.isDownvoted" icon slot="activator" @click="downvoteQuestion">
                <v-icon>thumb_down</v-icon>
              </v-btn>
            </v-layout>
          </v-flex>
         
          <v-flex xs10 sm11 md11 lg11>
            <v-card-title primary-title>
              <h5 class="title">{{ question.question }}</h5>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
              <h6 v-html="question.questionBody" class="subheading"></h6>
            </v-card-text>
          </v-flex>
        </v-layout>

        <v-layout>
          <v-flex>
            <v-card-actions>
              <v-spacer></v-spacer>
              <h6 class="caption ml-0">{{ question.questionUserName }},</h6>
              <h6 class="caption ml-0">{{ getRelativeTime(question.questionDate) }}</h6>
            </v-card-actions>
          </v-flex>
        </v-layout>

      </v-card>
    </v-container>

    <v-container fluid v-if="questionAnswers.length > 0">     
      <v-subheader>
        <v-flex xs6 sm9 md10 lg10>
          <h6 class="title">Answers</h6>
        </v-flex>

        <v-flex xs6 sm3 md2 lg2>
          <v-select
            color="pink darken-3"
            :items="sortItems"
            v-model="sortAnswerCriteria"
            label="Sort By"
            class="input-group--focused"
          ></v-select>
        </v-flex>
      </v-subheader>

      <v-card v-for="(answer, index) in questionAnswers" :key="answer.answerId" class="mb-3 py-3">
        <v-layout fill-height wrap>
          <v-flex xs2 sm1 md1 lg1>
            <v-layout align-center fill-height>
              <v-flex column>
                <v-flex class="text-xs-center">
                  <v-icon class="text-xs-center mb-4" v-if="currentUserId != question.questionUserId 
                && question.questionAcceptedAnswer === answer.answerId"
                large color="green darken-1">fas fa-check</v-icon>
                </v-flex>
                <v-flex class="text-xs-center">
                  <v-btn class="ma-0" flat :color="answer.isUpvoted" icon slot="activator" 
                  @click="upvoteAnswer(answer.answerId, index)">
                    <v-icon>thumb_up</v-icon>
                  </v-btn>
                </v-flex>
                <v-flex class="text-xs-center">
                  <h6 class="subheading">{{ answer.voteScore }}</h6>
                  <v-btn class="ma-0" flat :color="answer.isDownvoted" icon slot="activator" 
                  @click="downvoteAnswer(answer.answerId, index)">
                    <v-icon>thumb_down</v-icon>
                  </v-btn>
                </v-flex>
                <v-flex class="text-xs-center">
                  <v-btn 
                    v-if="currentUserId === question.questionUserId && question.questionAcceptedAnswer == null" 
                    flat color="grey" icon slot="activator" 
                    @click="acceptAnswer(answer.answerId)">
                    <v-icon large>fas fa-check</v-icon>
                  </v-btn>
                </v-flex>
                <v-flex class="text-xs-center">
                  <v-btn 
                    v-if="currentUserId === question.questionUserId 
                          && question.questionAcceptedAnswer === answer.answerId" 
                    flat color="green darken-1" icon slot="activator" 
                    @click="unacceptAnswer(answer.answerId)">
                    <v-icon large>fas fa-check</v-icon>
                  </v-btn>
                </v-flex>
              </v-flex>
            </v-layout>
          </v-flex>

          <v-flex xs10 sm11 md11 lg11>
            <v-card-title class="py-2 px-3">
              <h3>{{answer.userName}}</h3>
              <v-spacer></v-spacer>
              <h6 class="caption grey--text text--darken-1">{{ getRelativeTime(answer.answerDate) }}</h6>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
              <h6 v-html="answer.answer" class="subheading ml-0"></h6>
            </v-card-text>
          </v-flex>

          <v-flex xs10 sm10 offset-xs2 offset-sm1>
            <v-card-actions>
            </v-card-actions>
          </v-flex>
        </v-layout>

      </v-card>
    </v-container>

    <v-container fluid v-if="!isAnswered">
      <v-subheader>
        <h6 class="title">Your Answer</h6>
      </v-subheader>
      <v-card>
        <vue-editor v-model="currentUserAnswer" :editorToolbar="customToolbar"></vue-editor>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat color="pink darken-3" @click="submitAnswer">Submit</v-btn>
        </v-card-actions>
      </v-card>
    </v-container>

    <v-alert type="error" icon="error" transition="scale-transition" dismissible v-model="alert">
      The answer has to be atleast 10 characters. Try harder!
    </v-alert>
		
	</div>
</template>

<script>

import firebase from 'firebase'
import { VueEditor } from 'vue2-editor'

var moment = require('moment');

export default {
  name: 'question',

  components: {
    VueEditor
  },
  
  data () {
    return {
      currentUserId: '',
      currentUserAnswer: '',
      isAnswered: false,
      question: '',
      questionAnswers: [],
      voted: 'red darken-3',
      notVoted: 'grey lighten-1',
      sortItems: ['Upvotes', 'Most Recent'],
      sortAnswerCriteria: 'Upvotes',
      alert: false,
      customToolbar: [  
        [{ 'header': [false, 1, 2, 3, 4, 5, 6, ] }],
        ['bold', 'italic', 'underline', 'strike'],        
        [{'align': ''}, {'align': 'center'}, {'align': 'right'}, {'align': 'justify'}],
        ['blockquote', 'code-block'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],      
        [{ 'indent': '-1'}, { 'indent': '+1' }],          
        [{ 'color': [] }],          
        ['clean']                                       
      ]
    }
  },
  
  methods: {
    submitAnswer: function() {

      let textbookId = this.$route.params.textbookId;
      let questionId = this.$route.params.questionId;
      
      let userId = null;
      if (firebase.auth().currentUser != null) {
        userId = firebase.auth().currentUser.uid;
      } else {
        this.$router.replace('/login');
      }

      // If the input is not valid, return 
      if (!this.validateForm()) {
        return;
      }

      let self = this;
      
      // Get the name of the user and store the answer on the database
      firebase.database().ref('/users/' + userId).once('value').then(function(user) {
        let userName = user.val().name;
        let aRef = firebase.database().ref('/forum/' + textbookId + '/' + questionId + '/answers/' + userId);
        aRef.set({
          'userName': userName,
          'userId': userId,
          'answer': self.currentUserAnswer,
          'date': firebase.database.ServerValue.TIMESTAMP
        });
      });     
    },

    upvoteQuestion: function() {
      let textbookId = this.$route.params.textbookId;
      let questionId = this.$route.params.questionId;
      
      let userId = null;
      if (firebase.auth().currentUser != null) {
        userId = firebase.auth().currentUser.uid;
      } else {
        this.$router.replace('/login');
      }

      let ref = firebase.database().ref('/forum/' + textbookId + '/' + questionId + '/votes/' + userId);

      // If the user clicks on the upvote button again, then we remove the upvote, otherwise we store it
      if (this.question.isUpvoted === this.voted) {
        ref.remove();
      } else {
        ref.set({
          vote : 1  
        });
      }
    },

    downvoteQuestion: function() {
      let textbookId = this.$route.params.textbookId;
      let questionId = this.$route.params.questionId;
      
      let userId = null;
      if (firebase.auth().currentUser != null) {
        userId = firebase.auth().currentUser.uid;
      } else {
        this.$router.replace('/login');
      }

      // Redirect if userId is null
      if (userId == null) {
        this.$router.replace('/login');
      }

      let ref = firebase.database().ref('/forum/' + textbookId + '/' + questionId + '/votes/' + userId);
      
      // If the user clicks on the downvote button again, then we remove the downvote, otherwise we store it
      if (this.question.isDownvoted === this.voted) {
        ref.remove();
      } else {
        ref.set({
          vote : -1  
        });
      }
    },

    upvoteAnswer: function(answerId, index) {
      let textbookId = this.$route.params.textbookId;
      let questionId = this.$route.params.questionId;
      
      let userId = null;
      if (firebase.auth().currentUser != null) {
        userId = firebase.auth().currentUser.uid;
      } else {
        this.$router.replace('/login');
      }

      let ref = firebase.database().ref('/forum/' + textbookId + '/' + questionId + 
        '/answers/' + answerId + '/votes/' + userId);
      
      // If the user clicks on the upvote button again, then we remove the upvote, otherwise we store it
      if (this.questionAnswers[index].isUpvoted === this.voted) {
        ref.remove();
      } else {
        ref.set({
          vote : 1  
        });
      }
    },

    downvoteAnswer: function(answerId, index) {
      let textbookId = this.$route.params.textbookId;
      let questionId = this.$route.params.questionId;
      
      let userId = null;
      if (firebase.auth().currentUser != null) {
        userId = firebase.auth().currentUser.uid;
      } else {
        this.$router.replace('/login');
      }

      let ref = firebase.database().ref('/forum/' + textbookId + '/' + questionId + 
        '/answers/' + answerId + '/votes/' + userId);
      
      // If the user clicks on the downvote button again, then we remove the downvote, otherwise we store it
      if (this.questionAnswers[index].isDownvoted === this.voted) {
        ref.remove();
      } else {
        ref.set({
          vote : -1  
        });
      }
    },

    initializeQuestionVotes: function(votes) {
      
      let voteScore = 0;
      let isUpvoted = this.notVoted;
      let isDownvoted = this.notVoted;

      // If the question has votes, add them up, and update the UI
      if (votes != null) {
        let self = this;
        Object.keys(votes).forEach(function(voteKey) {
          voteScore += votes[voteKey].vote;
          if (self.currentUserId === voteKey) {
            if (votes[voteKey].vote === 1) {
              isUpvoted = self.voted;
            } else {
              isDownvoted = self.voted;
            }
          }
        });
      }

      let questionVotes = 
        {
          'voteScore': voteScore, 
          'isUpvoted': isUpvoted, 
          'isDownvoted': isDownvoted
        };
      
      return questionVotes;
    },

    initializeAnswerVotes: function(votes) {
      
      let voteScore = 0;
      let isUpvoted = this.notVoted;
      let isDownvoted = this.notVoted;

      // If the answer has votes, add them up, and update the UI
      if (votes != null) {
        let self = this;
        Object.keys(votes).forEach(function(voteKey) {
          voteScore += votes[voteKey].vote;
          if (self.currentUserId === voteKey) {
            if (votes[voteKey].vote === 1) {
              isUpvoted = self.voted;
            } else {
              isDownvoted = self.voted;
            }
          }
        });
      }

      let answerVotes = 
        {
          'voteScore': voteScore, 
          'isUpvoted': isUpvoted, 
          'isDownvoted': isDownvoted
        };

      return answerVotes;
    },

    acceptAnswer: function(answerId) {
      let textbookId = this.$route.params.textbookId;
      let questionId = this.$route.params.questionId;
      
      let userId = null;
      if (firebase.auth().currentUser != null) {
        userId = firebase.auth().currentUser.uid;
      } else {
        this.$router.replace('/login');
      }

      let ref = firebase.database().ref('/forum/' + textbookId + '/' + questionId);

      ref.update({
        'accepted': answerId 
      });
    },

    unacceptAnswer: function(answerId) {
      let textbookId = this.$route.params.textbookId;
      let questionId = this.$route.params.questionId;
      
      let userId = null;
      if (firebase.auth().currentUser != null) {
        userId = firebase.auth().currentUser.uid;
      } else {
        this.$router.replace('/login');
      }

      let ref = firebase.database().ref('/forum/' + textbookId + '/' + questionId);

      ref.update({
        'accepted': null 
      });
    },

    getRelativeTime: function(time) {
      return moment(time, "dddd, MMMM Do YYYY, h:mm:ss a").fromNow();
    },

    sortAnswers: function() {

      if (this.sortAnswerCriteria === 'Upvotes') {
        this.questionAnswers.sort(function(answerA, answerB) {
          let upvotesA = answerA.voteScore;
          let upvotesB = answerB.voteScore;

          // If answerA has more upvotes than answerB, give it a lower index
          if (upvotesA > upvotesB) {
            return -1;
          } 

          // If answerA has less upvotes than answerB, give it a higher index
          if (upvotesA < upvotesB) {
            return 1;
          }

          // If they are the same, then dont change any indexes 
          return 0;
        });
      }

      else if (this.sortAnswerCriteria === "Most Recent") {
        this.questionAnswers.sort(function(answerA, answerB) {
          let dateA = answerA.date;
          let dateB = answerB.date;

          // If answerA is more recent than answerB, give it a lower index
          if (moment(dateA).isAfter(moment(dateB))) {
            return -1;
          }

          // If answerA is before answerB, give it a higher index
          if (moment(dateA).isBefore(moment(dateB))) {
            return 1;
          }

          // If they are the same, then dont change any indexes 
          return 0;
        });
      }

      else {
        // Do nothing
      }
    },

    validateForm: function() {
      
      // Remove html tags from answer
      let answer = this.currentUserAnswer.replace(/<\/?[^>]+(>|$)/g, "");
      // Remove all spaces
      answer = answer.replace(/\s/g,'');
      
      if (answer == "" || answer.length < 10) {
        this.alert = true;
        return false;
      }

      this.alert = false;
      return true;
    }
  },

  watch: {
    // Whenever sortAnswerCriteria changes, this will get called
    sortAnswerCriteria: function (newSelection, oldSelection) {
      this.sortAnswers();
    }
  },

  created: function() {

    let textbookId = this.$route.params.textbookId;
    let questionId = this.$route.params.questionId;

    // Get the current user id
    this.currentUserId = firebase.auth().currentUser.uid;

    let self = this;

    let qRef = firebase.database().ref('/forum/' + textbookId + '/' + questionId);
    qRef.on('value', function(question) {
      if (question.exists()) {

        // Clear the answer array, since a new change triggers another database read
        self.questionAnswers = [];

        let questionData = question.val();

        // Get the question-specfic data 
        self.question = 
        {
          'question': questionData.question,
          'questionBody': questionData.body,
          'questionUserName': questionData.userName,
          'questionUserId': questionData.userId,
          'questionAcceptedAnswer': questionData.accepted,
          'questionDate': moment(questionData.date).local().format("dddd, MMMM Do YYYY, h:mm:ss a")
        };
        
        // Get the votes of the question
        let votes = questionData.votes;
        let questionVotes = self.initializeQuestionVotes(votes);
        self.question.voteScore = questionVotes.voteScore;
        self.question.isUpvoted = questionVotes.isUpvoted;
        self.question.isDownvoted = questionVotes.isDownvoted;

        // Get the answers of the question and the votes of each answer
        let answers = questionData.answers; 

        if (answers != null) {
          Object.keys(answers).forEach(function(answerKey) {
            answers[answerKey].answerId = answerKey;
            let answerVotes = self.initializeAnswerVotes(answers[answerKey].votes);
            answers[answerKey].voteScore = answerVotes.voteScore;
            answers[answerKey].isUpvoted = answerVotes.isUpvoted;
            answers[answerKey].isDownvoted = answerVotes.isDownvoted;
            answers[answerKey].answerDate = moment(answers[answerKey].date).local().format("dddd, MMMM Do YYYY, h:mm:ss a");
            self.questionAnswers.push(answers[answerKey]);

            // If the current user answered the question, set the isAnswered flag
            if (answers[answerKey].userId === self.currentUserId) {
              self.isAnswered = true;
            }
          });

          self.sortAnswers();
        }
      }
    });
  },

  beforeDestroy: function() {
    let textbookId = this.$route.params.textbookId;
    let questionId = this.$route.params.questionId;

    let qRef = firebase.database().ref('/forum/' + textbookId + '/' + questionId);
    qRef.off();
  }
}
</script>