const mongoose = require('mongoose');

// creating a schema in nodejs
const orderSchema = mongoose.Schema({
    //we used array of ordered items because user can order multiple items
    orderItems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrderItem',
        required: true
    }],
    shippingAddress1: {
        type: String,
        required: true
    },
    shippingAddress2: {
        type: String,
    },
    city: {
        type: String,
        required: true
    },
    zip: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    status: {
        type: String,
        rquired: true,
        default: 'Pending'
    },
    totalPrice: {
        type: Number
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    dateOrdered: {
        type: Date,
        default: Date.now
    }
})


// using virtualization in product schema to return the id without _ like "_id" to be "id" 
orderSchema.virtual('id').get(function (){
    return this._id.toHexString();
});
orderSchema.set('toJSON', {
    virtuals: true,
});



//creating model in nodejs
exports.Order = mongoose.model('Order', orderSchema);