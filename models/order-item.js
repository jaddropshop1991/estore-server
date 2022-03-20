const mongoose = require('mongoose');

// creating a schema in nodejs
const orderItemSchema = mongoose.Schema({
    //we used array of ordered items because user can order multiple items
    quantity: {
        type: Number,
        require: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }
})

//creating model in nodejs
exports.OrderItem = mongoose.model('OrderItem', orderItemSchema);