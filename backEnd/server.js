const express = require('express');
const app = express();
require('./config/dbConfig'); //connect db
const path = require('path');
const cors = require('cors');
const PORT = process.env.WEB_PORT || 4500;

//template engine
app.set('views', path.join(__dirname, '/views'));
// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));
// Serve image static files
app.use(express.static(path.join(__dirname, '../backend/public')));
app.set('view engine', 'ejs');
app.use(express.json());
app.use(cors()); // no longer required as serving in same host

//routes initializing
//route for file uploading
app.use('/files/upload', require('./routes/uploadRoute'));

//route for file downloading page
app.use('/filesDownload', require('./routes/downloadRoute'));

//route for file download
app.use('/filesDownload/download', require('./routes/downloadFile'));

//route for sending mail
app.use('/files/upload/sendMail', require('./routes/mailRoute'));

app.listen(PORT, console.log(`Listening on port: ${PORT}`));