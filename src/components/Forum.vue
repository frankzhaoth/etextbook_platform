<template>
  <div id="forum">
    <div>
      <v-btn @click="clickNewQuestion" flat>New Question</v-btn>
    </div>

    <v-data-table
      v-bind:headers="headers"
      :items="items"
      hide-actions
      class="elevation-1"
    >
      <template slot="items" slot-scope="props">
      	<tr @click="clickQuestion(props.item.qId)">
          <td>{{ props.item.question }}</td>
          <td class="text-xs-right">{{ props.item.userId }}</td>
        </tr>
      </template>
      
      <template slot="no-data">
        <v-alert :value="true" color="error" icon="warning">
          Sorry, there are no questions
        </v-alert>
      </template>
    </v-data-table>

  </div>
</template>

<script>

import firebase from 'firebase'

export default {
  name: 'forum',
  
  data () {
    return {
      headers: [
        {
          text: 'Question', 
          align: 'left',
          sortable: false,
          value: 'question'
        },
        {
          text: 'User', 
          value: 'userId',
          sortable: false
        }
      ],
      items: []
    }
  },
  
  methods: {
  	clickNewQuestion: function() {
  	  this.$router.push('/textbook/' + this.$route.params.textbookId + '/forum/new');
  	},
  	clickQuestion: function(qId) {
  	  this.$router.push('/textbook/' + this.$route.params.textbookId + '/forum/' + qId);
  	}
  },

  beforeCreate: function() {
    let self = this;
    let textbookId = self.$route.params.textbookId;

    let qRef = firebase.database().ref('/forum/' + textbookId);
    qRef.once('value', function(questions) {
      if (questions.exists()) {
      	questions.forEach(function(question) {
      	  let questionData = question.val();
      	  let questionKey = question.key;
      	  
      	  self.items.push({
      	  	question: questionData.question,
      	  	userId: questionData.userId,
      	  	qId: questionKey
      	  });
      	});   
      }
    });
  }
}
</script>