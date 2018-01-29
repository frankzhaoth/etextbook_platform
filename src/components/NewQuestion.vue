<template>
  <div id="newquestion">
	
	<v-card color="grey lighten-4" flat>
	  <v-subheader>New Question</v-subheader>
  	  <v-card-text>
        <v-text-field v-model="question" label="Question"></v-text-field>
        <v-container fluid>
          <v-layout row>
            <v-flex xs12>
              <v-text-field v-model="body" label="Body" textarea></v-text-field>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card-text>
    <v-btn @click="submit">Submit</v-btn>
  </v-card>

  </div>
</template>

<script>

import firebase from 'firebase'

export default {
  name: 'newquestion',
  data () {
    return {
      question: '',
      body: '',
    }
  },
  methods: {
  	submit: function() {
  	  let self = this;
  	  let textbookId = self.$route.params.textbookId;
  	  let userId = firebase.auth().currentUser.uid;

  	  if (userId != null) {
  	  	let ref = firebase.database().ref('forum/' + textbookId).push({
  	  	  'question': self.question,
  	  	  'body': self.body,
  	  	  'userId': userId
  	  	});
  	  	self.$router.replace('/textbook/' + self.$route.params.textbookId + '/forum/' + ref.key);
  	  } else {
  	  	console.log("currentUser returned null");
  	  }
  	}
  }
}
</script>