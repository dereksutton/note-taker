// Import needed modules
const exp = require('express');
const fileSys = require('fs');
const pth = require('path');

// Create an express application
const srv = exp();

// Set the port number for the server
const SERVER_PORT = process.env.PORT || 4000;

// Parse incoming requests with urlencoded and json middleware
srv.use(exp.urlencoded({ extended: true }));
srv.use(exp.json());

// Serve static files from the public directory
srv.use(exp.static('public'));

// Route for serving notes.html file
srv.get('/notes', (request, response) => {
  response.sendFile(pth.join(__dirname, './public/notes.html'));
});

// Route for serving note data as JSON
srv.get('/api/notes', (request, response) => {
  // Reading note data from db.json file
  fileSys.readFile('./db/db.json', 'utf8', (err, content) => {
    if (err) throw err;
    response.json(JSON.parse(content));
  });
});

// Route for adding a new note
srv.post('/api/notes', (request, response) => {
  // Add a unique id to the note data object using Date.now() method
  const noteData = request.body;
  noteData.id = Date.now();

  // Read note data from db.json file
  fileSys.readFile('./db/db.json', 'utf8', (err, content) => {
    if (err) throw err;
    const noteList = JSON.parse(content);
    // Add the new note to the note list
    noteList.push(noteData);

    // Write updated note list to db.json file
    fileSys.writeFile('./db/db.json', JSON.stringify(noteList, null, 2), (err) => {
      if (err) throw err;
      response.json(noteData);
    });
  });
});

// Route for deleting a note
srv.delete('/api/notes/:id', (request, response) => {
  // Parse the note id from the request params
  const targetId = parseInt(request.params.id, 10);

  // Read note data from db.json file
  fileSys.readFile('./db/db.json', 'utf8', (err, content) => {
    if (err) throw err;
    let noteList = JSON.parse(content);

    // Remove the note with the specified id from the note list
    noteList = noteList.filter((note) => note.id !== targetId);

    // Write updated note list to db.json file
    fileSys.writeFile('./db/db.json', JSON.stringify(noteList), err => {
      if (err) throw err;
      response.json({ message: 'Note deleted' });
    });
  });
});

// Default route for serving index.html file
srv.get('*', (request, response) => {
  response.sendFile(pth.join(__dirname, './public/index.html'));
});

// Start the server and listen for incoming requests
srv.listen(SERVER_PORT, () => {
  console.log(`Server actively listening on port ${SERVER_PORT}`);
});