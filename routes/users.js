//express importing and exporting routers api
const express = require('express');
const router = express.Router();
const {User} = require('../models/user');
const bcrypt = require('bcryptjs');
//using json web tokens
const jwt = require('jsonwebtoken');
//http://localhost:3000/api/v1/products
//get request
router.get(`/`, async (req, res)=>{
    
    //calling the model to get all the products from mongoDb
    const userList= await User.find().select('-passwordHash');
    
    if(!userList) {
        res.status(500).json({success: false})
    }
    res.send(userList);

})

// creating a new user used by the admin only
router.post('/', async (req, res)=>{
    
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        // hashing the password using bccrypt library
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,

    })
    

    if(!user)
    return res.status(404).send('the user cannot be registered!')
    user = await user.save();
    //I changed location of the bleow line
    res.send(user);
})


// get user by id model
router.get('/:id', async(req,res)=>{
    const user = await User.findById(req.params.id).select('-passwordHash');
    if(!user) {
        res.status(500).json({message: 'the user with the given ID was not found.'})
    }
    res.status(200).send(user);
})

// login user
router.post('/login', async (req,res) => {
    //checking if user exists
    const user = await User.findOne({email: req.body.email})
    const secret = process.env.secret;
    if(!user) {
        return res.status(400).send('the user not found');
    }
    //comparing password with the hash
    if(user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
        //using json web tokens to athenticate the user
        const token = jwt.sign(
            {
                userId: user.id,
                //allowing only the admin user to login to the admin with the line below
                isAdmin: user.isAdmin
            },
            secret,
            {expiresIn: '1d'}
        )
        
        res.status(200).send({user: user.email, token: token})
    } else {
        res.status(400).send('password is wrong!');
    }
   
})


// creating a new user
router.post('/register', async (req, res)=>{
    
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        // hashing the password using bccrypt library
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,

    })
    

    if(!user)
    return res.status(404).send('the user cannot be registered!')
    user = await user.save();
    //I changed location of the bleow line
    res.send(user);
})

// get number of users
router.get(`/get/count`, async (req, res)=>{
    
    //calling the model to get all the products from mongoDb
    const userCount = await User.countDocuments()
    
    if(!userCount) {
        res.status(500).json({success: false})
    }
    res.send({
        userCount: userCount
    });

})


// delete user by id model
router.delete('/:id', (req, res)=>{
    User.findByIdAndRemove(req.params.id)
    .then(user =>{
        if(user){
            return res.status(200).json({success: true, message: 'the user is deleted'})
        }
        else {
            return res.status(404).json({success: false, message: 'user not found'})
        }
    }).catch(err=>{
        return res.status(400).json({success:false, error: err})
    })
})

//exporting the routers
module.exports = router;