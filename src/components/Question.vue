<template>
	<div id="question">
    <v-card color="grey lighten-4" flat>
      <v-card-title primary-title>{{ question }}</v-card-title>
      <v-card-text>{{ body }}</v-card-text>
    </v-card>

    <v-card v-for="answer in answers" :key="answer.answer" color="grey lighten-4" flat>
      <v-card-text>{{ answer.answer }}</v-card-text>
    </v-card>

    <v-card color="grey lighten-4" flat>
      <v-subheader>Your Answer</v-subheader>
        <v-card-text>
          <v-container fluid>
            <v-layout row>
              <v-flex xs12>
                <v-text-field v-model="answer" label="Answer" textarea></v-text-field>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
      <v-btn @click="submitAnswer">Submit</v-btn>
    </v-card>
		
	</div>
</template>

<script>

import firebase from 'firebase'

export default {
  name: 'question',
  
  data () {
    return {
      question: '',
      body: '',
      userId: '',
      answer: '',
      answers: []
    }
  },
  
  methods: {
    submitAnswer: function() {
      let self = this;
      let textbookId = self.$route.params.textbookId;
      let questionId = self.$route.params.questionId;
      let userId = firebase.auth().currentUser.uid;

      if (userId != null) {
        let aRef = firebase.database().ref('/forum/' + textbookId + '/' + questionId + '/answers/' + userId);
        aRef.set({
          'answer': self.answer
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
        self.userId = questionData.userId;

        Object.keys(answers).forEach(function(answer) {
          self.answers.push(answers[answer]);
        });
        console.log(self.answers);
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