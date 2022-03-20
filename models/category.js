const mongoose = require('mongoose');

// creating a schema in nodejs
const categorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    icon: {
        type: String
    },
    color: {
        type: String
    }
})

//creating model in nodejs
exports.Category = mongoose.model('Category', categorySchema);