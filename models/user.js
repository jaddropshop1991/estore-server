const mongoose = require('mongoose');

// creating a schema in nodejs
const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
       type: String,
       required: true
    },
    passwordHash: {
        type: String,
        required: true
     },
    phone: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
     },
     street: {
        type: String,
        default: ''
     },
     apartment: {
        type: String,
        default: ''
     },
     zip: {
        type: String,
        default: ''
     },
     city: {
        type: String,
        default: ''
     },
     country: {
        type: String,
        default: ''
     }
})

// using virtualization in user schema to return virtual id without _ like "_id" to be "id" 
userSchema.virtual('id').get(function (){
    return this._id.toHexString();
});
userSchema.set('toJSON', {
    virtuals: true,
});

exports.User = mongoose.model('User', userSchema);

//creating model in nodejs
exports.User = mongoose.model('User', userSchema);