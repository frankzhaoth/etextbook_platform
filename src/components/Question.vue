<template>
	<div id="question">
    <v-card color="grey lighten-4" flat>
      <v-card-title primary-title>{{ question }}</v-card-title>
      <v-card-text>{{ body }}</v-card-text>
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
      userId: ''
    }
  },
  
  methods: {

  },

  created: function() {
    let self = this;
    let textbookId = self.$route.params.textbookId;
    let questionId = self.$route.params.questionId;

    let qRef = firebase.database().ref('/forum/' + textbookId + '/' + questionId);
    qRef.once('value', function(question) {
      if (question.exists()) {
        let questionData = question.val();
        self.question = questionData.question;
        self.body = questionData.body;
        self.userId = questionData.userId;
      }
    });
  }
}
</script>