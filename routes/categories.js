//express importing and exporting routers api
const express = require('express');
const router = express.Router();
const {Category} = require('../models/category');

//http://localhost:3000/api/v1/products
//get request
router.get(`/`, async (req, res)=>{
    
    //calling the model to get all the products from mongoDb
    const categoryList= await Category.find();
    
    if(!categoryList) {
        res.status(500).json({success: false})
    }
    res.status(200).send(categoryList);

})

// get category by id model
router.get('/:id', async(req,res)=>{
    const category = await Category.findById(req.params.id);
    if(!category) {
        res.status(500).json({message: 'the category with the given ID was not found.'})
    }
    res.status(200).send(category);
})

//create new category post model
router.post('/', async (req, res)=>{
    let category = new Category({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color
    })
    

    if(!category)
    return res.status(404).send('the category cannot be created!')
    category = await category.save();
    //I changed location of the bleow line
    res.send(category);
})

//update category 
router.put('/:id', async (req, res)=>{
    const category = await Category.findByIdAndUpdate(
       req.params.id,
       {
           name: req.body.name,
           icon: req.body.icon,
           color: req.body.color,
       },
       { new: true}
    )

    if(!category)
    return res.status(400).send('the category cannot be updated!')
    //I changed location of the bleow line
    res.send(category);

})

//api/v1/id
// delete category by id model
router.delete('/:id', (req, res)=>{
    Category.findByIdAndRemove(req.params.id)
    .then(category =>{
        if(category){
            return res.status(200).json({success: true, message: 'the category is deleted'})
        }
        else {
            return res.status(404).json({success: false, message: 'category not found'})
        }
    }).catch(err=>{
        return res.status(400).json({success:false, error: err})
    })
})

//exporting the routers
module.exports = router;