//express importing and exporting routers api
const express = require('express');
const router = express.Router();
const {Product} = require('../models/product');
const {Category} = require('../models/category');
//we used mongoose to catch the errors that were hanging
const mongoose = require('mongoose');
const multer = require('multer');
//for specifiying list of extensions to be uploaded to the backend
const FILE_TYPE_MAP = {
    //Mime type of the file and its extension
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'

}

// using multer library to store images and images path with ful disk code integration from the library
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        //validate the error
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');

        if(isValid) {
            uploadError = null
        }
        //we changed the upload field to fit ours
      cb(uploadError, 'public/uploads')
    },
    filename: function (req, file, cb) {
     //we changed this line to fit out image naming convention
      const fileName =  file.originalname.split(' ').join('-');
      //check the mime type before asigning the extension as a value
      const extension = FILE_TYPE_MAP[file.mimetype];
      cb(null, `${fileName}-${Date.now()}.${extension}`)
    }
  })
  const uploadOptions = multer({ storage: storage })


//http://localhost:3000/api/v1/products
//get request
router.get(`/`, async (req, res)=>{
    //.select('name image -_id')
    //calling the model to get all the products from mongoDb
    //using get with query paramenters to find many products belonging each to different passed categories at once 
    //using split by , and passing the multiple categories as an array to be used like http://localhost:3000/api/v1/products?categories=6222800c0c9b99c1c754e05f,6223a1324b778d36f57a062e
    let filter ={};
    if(req.query.categories){
        filter = {category: req.query.categories.split(',')}
    }
    const productList= await Product.find(filter).populate('category');
    
    if(!productList) {
        res.status(500).json({success: false})
    }
    res.send(productList);

})

//get product by ID
router.get(`/:id`, async (req, res)=>{
    
    //calling the model to get all the products from mongoDb
    const product= await Product.findById(req.params.id).populate('category');
    
    if(!product) {
        res.status(500).json({success: false})
    }
    res.send(product);

})


//post request
//we pass also multer library uploadOptions with the image file we created above in the post request
router.post(`/`, uploadOptions.single('image'), async (req, res)=>{
    
    //validating category given by the user from the frontend
    const category = await Category.findById(req.body.category);
    if(!category) return res.status(400).send('Invalid Category')
    
    //checking in case if there is no image file send
    const file =req.file;
    if(!file) return res.status(400).send('No image in the request')
    //from multer library we created above
    const fileName = req.file.filename
    //to get the full path url of the application to add the image name above to 
    const basePath =`${req.protocol}://${req.get('host')}`+"/public/uploads/";
    //including the model in post request
    const product = new Product({
       name: req.body.name,
       description: req.body.description,
       richDescription: req.body.richDescription,
       //fileName from multer library we created above
       image: `${basePath}${fileName}`,
       brand: req.body.brand,
       price: req.body.price,
       category: req.body.category,
       countInStock: req.body.countInStock,
       rating: req.body.rating,
       numReviews: req.body.numReviews,
       isFeatured: req.body.isFeatured
    })

    

    if(!product)
    
    return res.status(500).send('the product cannot be created')
    res.send(product);
    //I changed the location of the line below
    product = await product.save();

    //save model to database
    {/*product.save().then((createdProduct =>{
        res.status(201).json(createdProduct)
    })).catch((err) =>{
        res.status(500).json({
            error: err,
            success: false,
        })
    })*/}
   
})


//update product
router.put('/:id', async (req, res)=>{
    // we used mongoose line below to catch the error that was hanging the server
    if(!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Product Id')
    }
    //validating category given by the user from the frontend
    const category = await Category.findById(req.body.category);
    if(!category) return res.status(400).send('Invalid Category')

    const product = await Product.findByIdAndUpdate(
       req.params.id,
       {
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: req.body.image,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured
       },
       { new: true}
    )

    if(!product)
    return res.status(500).send('the product cannot be updated!')
    //I changed location of the bleow line
    res.send(product);

})


// delete product by id model
router.delete('/:id', (req, res)=>{
    Product.findByIdAndRemove(req.params.id)
    .then(product =>{
        if(product){
            return res.status(200).json({success: true, message: 'the product is deleted'})
        }
        else {
            return res.status(404).json({success: false, message: 'product not found'})
        }
    }).catch(err=>{
        return res.status(400).json({success:false, error: err})
    })
})


//we can use mongoose to make calculations on the products in the model below like getting product count
//like router.get('/get/count', )
router.get(`/get/count`, async (req, res)=>{
    
    //calling the model to get all the products from mongoDb
    const productCount = await Product.countDocuments()
    
    if(!productCount) {
        res.status(500).json({success: false})
    }
    res.send({
        ProductCount: productCount
    });

})


//Get Featured products list and limit it if the user passed a certain featured product count number like http://localhost:3000/api/v1/products/get/featured/3
router.get(`/get/featured/:count`, async (req, res)=>{
    const count = req.params.count ? req.params.count : 0
    //calling the model to get all the products from mongoDb
    const products = await Product.find({isFeatured: true}).limit(+count);
    
    if(!products) {
        res.status(500).json({success: false})
    }
    res.send(products);

})


//update the product to include multiple image galley with limiting the number of uploaded images to 10
router.put('/gallery-images/:id', 
    uploadOptions.array('images', 10), 
    async (req, res)=>{
        if(!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).send('Invalid Product Id')
        }

        const files = req.files;
        let imagesPaths = [];
        const basePath =`${req.protocol}://${req.get('host')}`+"/public/uploads/";

        if(files){
            files.map((file) => {
                imagesPaths.push(`${basePath}${file.filename}`);
            });
        }
       
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
             
             images: imagesPaths
             
            },
            { new: true}
         )

    if(!product)
    return res.status(500).send('the product cannot be updated!');
    //I changed location of the bleow line
    res.send(product);

})
//exporting the routers
module.exports = router;