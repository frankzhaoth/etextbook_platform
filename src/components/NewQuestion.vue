<template>
  <div id="newquestion">
    <v-container fluid>
    	
      <v-card flat>
        <v-layout>
          <v-flex>
          	<v-card-text>
              <v-text-field v-model="question" label="Question"></v-text-field>
              <vue-editor v-model="body" :editorToolbar="customToolbar"></vue-editor>
            </v-card-text>
            
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn flat color="pink darken-3" @click="submit">Submit</v-btn>
            </v-card-actions>
          </v-flex>
        </v-layout>
      </v-card>

    </v-container>
  </div>
</template>

<script>

import firebase from 'firebase'
import { VueEditor } from 'vue2-editor'

export default {
  name: 'newquestion',

  components: {
    VueEditor
  },

  data () {
    return {
      question: '',
      body: '',
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
  	submit: function() {
  	  let self = this;
  	  let textbookId = self.$route.params.textbookId;
  	  let userId = firebase.auth().currentUser.uid;

  	  if (userId != null) {
        
        // Get the name of the user
        firebase.database().ref('/users/' + userId).once('value').then(function(user) {
          let userName = user.val().name;

          // Store the question on the database
          let ref = firebase.database().ref('forum/' + textbookId).push({
          'question': self.question,
          'body': self.body,
          'userName': userName,
          'userId': userId
          });

          // Redirect to the question page
          self.$router.replace('/textbook/' + self.$route.params.textbookId + '/forum/' + ref.key);
        });
  	  } else {
  	  	console.log("currentUser returned null");
  	  }
  	}
  }
}
</script>