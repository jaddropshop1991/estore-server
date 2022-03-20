const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
//we use cors library to prevent any backend frontendbcommunication error in the future
const cors = require('cors');
//calling env variable in env file
require('dotenv/config');
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');
app.use(cors());
app.options('*', cors());

//middlewares
// middleware bodyparser
app.use(bodyParser.json());
// middleware to display log request in specific format
app.use(morgan('tiny'));
//using the jwt middle ware to check token with secret for the authentication and acessing of the apis by the user
app.use(authJwt());

//define the images path as a static static to be shown in the frontend or in the browser
app.use('/public/uploads', express.static(__dirname + '/public/uploads'));
//error handler from errorhandler file function
app.use(errorHandler);

const api = process.env.API_URL;
//using the routers
const productsRoutes = require('./routes/products');
const categoriesRoutes = require('./routes/categories');
const usersRoutes = require('./routes/users');
const ordersRoutes = require('./routes/orders');
const res = require('express/lib/response');



//Routers
app.use(`${api}/products`, productsRoutes);
app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/orders`, ordersRoutes);


// connecting to MongoDb atlas database using mongoose
mongoose.connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'eshop-database'
})
.then(() => {
    console.log("database connection is ready...");
})
.catch((err)=> {
    console.log(err);
})


//start the server
// Development
{/*app.listen(3000 , ()=>{
    
    console.log("server is running http://localhost:3000");
})*/}


// Production
var server = app.listen(process.env.PORT || 3000, function () {
	var port = server.address().port;
	console.log("Express is working on port " + port)
})