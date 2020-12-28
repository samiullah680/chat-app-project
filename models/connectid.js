const mongoose = require('mongoose');

const connectuserschema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
   
});

module.exports = new mongoose.model('connectid', connectuserschema);