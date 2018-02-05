<template>
	<div id="question" class="ma-3">

    <v-card flat>
      <v-card-title primary-title>
        <h5 class="headline">{{ question }}</h5>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <h6 v-html="body" class="subheading ml-4"></h6>
      </v-card-text>
      <v-card-text>
        <h6 class="caption ml-0">By: {{ userName }}</h6>
      </v-card-text>
      <v-divider></v-divider>
    </v-card>

    <v-subheader>
      <h6 class="title">Answers</h6>
    </v-subheader>
    <v-card v-for="answer in answers" :key="answer.answer" flat>
      <v-card-text>
        <h6 v-html="answer.answer" class="subheading ml-0"></h6>
      </v-card-text>
      <v-card-text>
        <h6 class="caption ml-0">By: {{ answer.userName }}</h6>
      </v-card-text>
      <v-divider></v-divider>
    </v-card>

    <v-subheader>
      <h6 class="title">Your Answer</h6>
    </v-subheader>
    <v-card flat>
      <vue-editor v-model="answer" :editorToolbar="customToolbar"></vue-editor>
      <v-btn flat color="primary" @click="submitAnswer">Submit</v-btn>
    </v-card>
		
	</div>
</template>

<script>

import firebase from 'firebase'
import { VueEditor } from 'vue2-editor'

export default {
  name: 'question',

  components: {
    VueEditor
  },
  
  data () {
    return {
      question: '',
      body: '',
      userName: '',
      userId: '',
      answer: '',
      answers: [],
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
      let self = this;
      let textbookId = self.$route.params.textbookId;
      let questionId = self.$route.params.questionId;
      let userId = firebase.auth().currentUser.uid;

      if (userId != null) {
        // Get the name of the user
        firebase.database().ref('/users/' + userId).once('value').then(function(user) {
          let userName = user.val().name;
          let aRef = firebase.database().ref('/forum/' + textbookId + '/' + questionId + '/answers/' + userId);
          aRef.set({
            'userName': userName,
            'answer': self.answer
          });
        });
      } else {
        console.log("currentUser returned null");
      }
    }
  },

  created: function() {
    let self = this;
    let textbookId = self.$route.params.textbookId;
    let questionId = self.$route.params.questionId;

    let qRef = firebase.database().ref('/forum/' + textbookId + '/' + questionId);
    qRef.on('value', function(question) {
      if (question.exists()) {
        let questionData = question.val();
        let answers = questionData.answers;

        self.question = questionData.question;
        self.body = questionData.body;
        self.userName = questionData.userName;
        self.userId = questionData.userId;

        Object.keys(answers).forEach(function(answer) {
          self.answers.push(answers[answer]);
        });
      }
    });
  },

  beforeDestroy: function() {
    let self = this;
    let textbookId = self.$route.params.textbookId;
    let questionId = self.$route.params.questionId;

    let qRef = firebase.database().ref('/forum/' + textbookId + '/' + questionId);
    qRef.off();
  }
}
</script>