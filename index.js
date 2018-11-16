const http = require('http');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const blogsRouter = require('./controllers/blogs');

app.use(cors());
app.use(bodyParser.json());
app.use('/api/blogs', blogsRouter);

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

mongoose
    .connect(process.env.MONGOLAB_URI, { useNewUrlParser: true })
    .then( () => {
        console.log('connected to database', process.env.MONGOLAB_URI);
    })
    .catch( err => {
        console.log(err);
    });

const PORT = 3003;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
