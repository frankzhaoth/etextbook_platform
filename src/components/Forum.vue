<template>
  <div id="forum" class="ma-3">
    <div>
      <v-btn color="pink darken-3" @click="clickNewQuestion" flat>New Question</v-btn>
    </div>

    <v-data-table
      v-bind:headers="headers"
      :items="items"
      hide-actions
      class="elevation-1"
    >
      <template slot="items" slot-scope="props">
      	<tr @click="clickQuestion(props.item.qId)">
          <td> {{ props.item.voteScore }}</td>
          <td>{{ props.item.question }}</td>
          <td class="text-xs-right">{{ props.item.userName }}</td>
        </tr>
      </template>
      
      <template slot="no-data">
        <v-alert :value="true" color="error">Sorry, there are no questions</v-alert>
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
          text: 'Upvotes',
          align: 'left',
          sortable: true,
          value: 'voteScore'
        },
        {
          text: 'Question', 
          align: 'left',
          sortable: false,
          value: 'question'
        },
        {
          text: 'User', 
          value: 'userName',
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

  created: function() {
    let self = this;
    let textbookId = self.$route.params.textbookId;

    let qRef = firebase.database().ref('/forum/' + textbookId);
    qRef.once('value', function(questions) {
      if (questions.exists()) {
      	questions.forEach(function(question) {
      	  let questionData = question.val();
      	  let questionKey = question.key;
          let questionVotes = questionData.votes;

          // Calculate the vote score of a question 
          let voteScore = 0;

          if (questionVotes != null) {
            Object.keys(questionVotes).forEach(function(voteKey) {
              voteScore += questionVotes[voteKey].vote;
            });
          }
      	  
      	  self.items.push({
      	  	'question': questionData.question,
            'userName': questionData.userName,
      	  	'userId': questionData.userId,
      	  	'qId': questionKey,
            'voteScore': voteScore
      	  });
      	});   
      }
    });
  }
}
</script>