if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

let port = process.env.PORT;
let mongolabUri = process.env.MONGOLAB_URI;

if (process.env.NODE_ENV === 'test') {
    port = process.env.TEST_PORT;
    mongolabUri = process.env.TEST_MONGOLAB_URI;
}

module.exports = {
    mongolabUri,
    port
};