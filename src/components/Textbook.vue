<template>
	<div id="textbook">
		<h1>{{ title }}</h1>

    <div>
      <v-btn @click="clickForum" flat>Forum</v-btn>
    </div>
	</div>
</template>

<script>
import firebase from 'firebase'

export default {
  name: 'textbook',
  
  data () {
    return {
      title: '',
      author: '',
      isbn: '',
      cover: ''
    }
  },
  
  methods: {
    clickForum: function() {
      this.$router.push('/textbook/' + this.$route.params.textbookId + '/forum');
    }
  },

  created: function() {
    
    let self = this;

    // Get the textbook id from params
    let textbookId = self.$route.params.textbookId;

    // Read the textbook data from the database
    firebase.database().ref('/textbooks/' + textbookId).once('value')
    .then(function(textbook) {
      if (textbook.exists()) {
        let textbookData = textbook.val();
        self.title = textbookData.title;
        self.author = textbookData.author;
        self.isbn = textbookData.isbn;

        let coverRef = firebase.storage().ref('textbooks/covers/' + textbookData.cover);
        coverRef.getDownloadURL().then(function(url) {
	      self.cover = url;
	    });
      }
    })
    .catch(function(error) {
      console.log(error);
    });
  }
}
</script>