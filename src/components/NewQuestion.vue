<template>
  <div id="newquestion">
    <v-container fluid>

      <v-alert type="error" icon="error" transition="scale-transition" dismissible v-model="alert">
        The question title or description is not present or less than 10 characters.
      </v-alert>
    	
      <v-card flat>
        <v-layout>
          <v-flex>
          	<v-card-text>
              <v-text-field v-model="question" label="Question" color="pink darken-3"></v-text-field>
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

  props: ['page-prop'],

  data () {
    return {
      question: '',
      body: '',
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
  	submit: function() {

      // If the input is not valid, return
      if (!this.validateForm()) {
        return;
      }

  	  let self = this;
  	  let textbookId = self.$route.params.textbookId;
  	  let userId = firebase.auth().currentUser.uid;
      let routeName = self.$route.name;

  	  if (userId != null) {
        
        // Get the name of the user
        firebase.database().ref('/users/' + userId).once('value').then(function(user) {
          let userName = user.val().name;

          // Store the question on the database
          let ref = firebase.database().ref('forum/' + textbookId).push({
          'question': self.question,
          'body': self.body,
          'userName': userName,
          'userId': userId,
          'date': firebase.database.ServerValue.TIMESTAMP,
          'page': self.pageProp
          });

          // This component is being reused in the textbook view url and the new question url
          if (routeName === "pdfTester") {
            // When we are in the textbook view url, we notify the parent that the question was submitted
            self.notifyParent();
          } else {
            // We are in the new question url, so redirect to the question page
            self.$router.replace('/textbook/' + self.$route.params.textbookId + '/forum/' + ref.key);
          }
        });
  	  } else {
  	  	console.log("currentUser returned null");
  	  }
  	},

    validateForm: function() {
      let question = this.question;
      let body = this.body; 

      // Remove html tags from body
      body = body.replace(/<\/?[^>]+(>|$)/g, "");
      // Remove all spaces
      body = body.replace(/\s/g,'');

      if (question == "" || question.length < 10) {
        this.alert = true;
        return false;
      } 

      else if (body == "" || body.length < 10) {
        this.alert = true;
        return false;
      } 

      else {
        this.alert = false;
        return true;
      }
    },

    notifyParent() {
      this.$emit('clicked');
    }
  }
}
</script>