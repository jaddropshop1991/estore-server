//express importing and exporting routers api
const express = require('express');
const router = express.Router();
const {Order} = require('../models/order');
const {OrderItem} = require('../models/order-item');

//http://localhost:3000/api/v1/products
//get request
router.get(`/`, async (req, res)=>{
    
    //calling the model to get all the products from mongoDb
    // populate by user and name and sort them by date from newest to oldest
    const orderList= await Order.find().populate('user','name').sort({'dateOrdered': -1});
    
    if(!orderList) {
        res.status(500).json({success: false})
    }
    res.send(orderList);

})

//create new order post model
router.post('/', async (req, res)=>{

    // looping through the orderedItmes Ids
    //combining all promises below to one promise so the function would not turn back an error
    const orderItemsIds = Promise.all (req.body.orderItems.map(async orderItem =>{
        //using the OrderItem model
        let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product
        })
        newOrderItem = await newOrderItem.save();
        //return only id
        return newOrderItem._id;
    }))
    const orderItemsIdsResolved = await orderItemsIds;
    //console.log(orderItemsIds);
    //looping on orderItems to get the total prices
    const totalPrices = await Promise.all(orderItemsIdsResolved.map(async (orderItemId)=>{
        const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price');
        const totalPrice = orderItem.product.price * orderItem.quantity;
        return totalPrice
    }))
    // get the sum of all numbers inside th array
    const totalPrice = totalPrices.reduce((a,b) => a +b, 0);

    //console.log(totalPrices)
    let order = new Order({
        orderItems: orderItemsIdsResolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: totalPrice,
        user: req.body.user
    })
    

    if(!order)
    return res.status(404).send('the order cannot be created!')
    order = await order.save();
    //I changed location of the bleow line
    res.send(order);
})

//get one order detail by id
router.get(`/:id`, async (req, res)=>{
    
    //calling the model to get all the products from mongoDb
    // populate by user and name
    const order= await Order.findById(req.params.id)
    .populate('user','name')
    .populate({
        path: 'orderItems', populate: {
            path: 'product', populate: 'category'}
        });
    
    if(!order) {
        res.status(500).json({success: false})
    }
    res.send(order);

})


//update order
router.put('/:id', async (req, res)=>{
    const order = await Order.findByIdAndUpdate(
       req.params.id,
       {
           status: req.body.status
       },
       { new: true}
    )

    if(!order)
    return res.status(400).send('the order cannot be updated!')
    //I changed location of the bleow line
    res.send(order);

})


// delete order by id model
router.delete('/:id', (req, res)=>{
    // deleting also the remaining ordered Items related to the deleted order
    Order.findByIdAndRemove(req.params.id).then(async order =>{
       if(order) {
        await order.orderItems.map(async orderItem => {
            await OrderItem.findByIdAndRemove(orderItem)
        })
            return res.status(200).json({success: true, message: 'the order is deleted'})
        } else {
            return res.status(404).json({success: false, message: 'order not found'})
        }
    }).catch(err=>{
        return res.status(400).json({success:false, error: err})
    })
})

//geting total sales
router.get('/get/totalsales', async (req, res)=>{
    //geting total sales from the database using mongoose by using aggregate or join
    const totalSales= await Order.aggregate([
        //using mongoose to get total sales with are the sum of all totalPrice we created above
        {$group: {_id: null, totalsales: {$sum: '$totalPrice'}}}
    ])
    if(!totalSales) {
        return res.status(400).send('the order sales cannot be generated')

    }
    //we do this to get only the total sales without the null id we sepecified for mongoose
    res.send({totalsales: totalSales.pop().totalsales})
})

//get orders count
router.get(`/get/count`, async (req, res)=>{
    
    //calling the model to get all the products from mongoDb
    const orderCount = await Order.countDocuments()
    
    if(!orderCount) {
        res.status(500).json({success: false})
    }
    res.send({
        orderCount: orderCount
    });

})

//exporting the routers
module.exports = router;