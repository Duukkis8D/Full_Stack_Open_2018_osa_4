const http = require('http');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const blogsRouter = require('./controllers/blogs');
const config = require('./utils/config');

app.use(cors());
app.use(bodyParser.json());
app.use('/api/blogs', blogsRouter);

mongoose
    .connect(config.mongolabUri, { useNewUrlParser: true })
    .then( () => {
        console.log('connected to database', config.mongolabUri);
    })
    .catch( err => {
        console.log(err);
    });

const server = http.createServer(app);

server.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
});

server.on('close', () => {
    mongoose.connection.close();
});

module.exports = {
    app, server
};