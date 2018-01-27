<template>
  <div id="adminportal">
    
    <form>
      <v-text-field
        label="Title"
        v-model="title"
        required
      ></v-text-field>

      <v-text-field
        label="Author"
        v-model="author"
        required
      ></v-text-field>

      <v-text-field
        label="ISBN"
        v-model="isbn"
        required
      ></v-text-field>

      <label for="coverButton">Book cover:</label><br>
      <input type="file" id="coverButton" value="upload" required @change="processCover($event)"/>
      <v-progress-linear v-model="cover_progress"></v-progress-linear>
    
      <label for="coverButton">Book:</label><br>
      <input type="file" id="bookButton" value="upload" required @change="processBook($event)"/>
      <v-progress-linear v-model="book_progress"></v-progress-linear>
      
      <v-btn @click="submit">submit</v-btn>
    </form> 

    <v-layout row justify-center>
    <v-dialog v-model="dialog" persistent max-width="290">
      <v-card>
        <v-card-title class="headline">Textbook was successfully added!</v-card-title>
        <v-card-text>Feel free to add another one.</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" flat @click.native="dialog = false">OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>

  </div>
</template>

<script>
import firebase from 'firebase'

export default {
  name: 'adminportal',
  data () {
    return {
      title: '',
      author: '',
      isbn: '',
      cover_file: '',
      book_file: '',
      cover_progress: 0,
      book_progress: 0,
      dialog: false
    }
  },
  methods: {
    processCover: function(event) {
      this.cover_file = event.target.files[0];
    },

    processBook: function(event) {
      this.book_file = event.target.files[0];
    },

    submit: function() {
      
      let self = this;

      // Get a reference to the cover storage and textbook storage
      let coverRef = firebase.storage().ref('textbooks/covers/' + self.cover_file.name);
      let bookRef = firebase.storage().ref('textbooks/' + self.book_file.name);

      // Get a reference to the database to store the textbooks 
      let textbookDb = firebase.database().ref('textbooks');
      
      // Upload the cover first
      let coverUpload = coverRef.put(self.cover_file);

      coverUpload.on(firebase.storage.TaskEvent.STATE_CHANGED, 
        function(snapshot) {
          self.cover_progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        },
        function(error) {
          // Handle errors
        },
        function() {
          // If cover upload is successful, upload book 
          let bookUpload = bookRef.put(self.book_file);
          bookUpload.on(firebase.storage.TaskEvent.STATE_CHANGED,
            function(snapshot) {
              self.book_progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            },
            function(error) {
              // Handle errors
            },
            function() {
              // If book upload is successful, write to database 
              let textbook = textbookDb.push({
                'title': self.title,
                'author': self.author,
                'isbn': self.isbn,
                'cover': self.cover_file.name,
                'url': self.book_file.name},
                function() {
                  // When completed clear all the fields and show dialog
                  Object.assign(self.$data, self.$options.data());
                  self.dialog = true;
                });
            });
        });
    }
  }
}
</script>