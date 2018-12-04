const express = require('express');
const cors = require('cors');
const mongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser'); //read form data and form fields
const methodOverride = require('method-override'); //to support PUT and DELETE FROM browsers

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(methodOverride('_method'));

//const mongoServerURL = "mongodb://localhost:27017";
const mongoServerURL = "mongodb://user1:asmaa123@ds111608.mlab.com:11608/invoicedb";	
	
	

//1. add defualt route to the express app that display all as JSON 
	app.get('/', (request, response ,next) => {
		mongoClient.connect(mongoServerURL, (err, db) => {
		if (err)
			console.log("DB Connect Error:" +err.message);

		//connect to database
		const flowerdb = db.db("invoicedb");
		
			//read from the collections 
			flowerdb.collection("invoices").find({}).toArray((err, itemDocsArray) => {
				if (err)
					console.log(err.message);

				response.send(JSON.stringify(itemDocsArray)); 				
			}); 
			db.close(); 
		}); 
	});

//To handle many routes using request parameter
//The request parameter is :Type
app.get('/:Type', (request, response , next) => {
	mongoClient.connect(mongoServerURL, (err, db) => {
		if (err)
			console.log("Cannot connect to Mongo:"+err.message);

		//connect to item
		const flowerdb = db.db("invoicedb");
		let FlowerType = request.params.Type;
		if (FlowerType == "Rose")
			FlowerType = "rose";
		else if (FlowerType == "hydra")
			FlowerType = "hydrangea";
		else if (FlowerType == "Lilly")
			FlowerType = "lilly";
		else if (FlowerType == "Sun")
			FlowerType = "sun flower";
		
		
		console.log(FlowerType);
		//build the query filter
		let query = {Type:FlowerType};

		//read from flowerdb collection
		flowerdb.collection("invoices").find(query).toArray((err, itemsArray) => {
			if (err)
				console.log(err.message);

			response.send(JSON.stringify(itemsArray));
		});

		//close the connection to the db
		db.close();
	});
});

//get one item by name - used in update and delete web pages
app.get('/invoices/:Order_id', (request, response, next) => {

const OrderID = request.params.OrderID;

	mongoClient.connect(mongoServerURL, (err, db) => {
		if (err)
			console.log("Cannot connect to Mongo:"+err.message);

		//connect to item
		const flowerdb = db.db("invoicedb");

	console.log(OrderID);
		//build the query filter
		let query = {Order_id:OrderID};

		//read from invoicedb invoices collection
		invoicedb.collection("invoices").find(query).toArray((err, itemsArray) => {
			if (err)
				console.log(err.message);

			response.send(JSON.stringify(itemsArray));
		});

		//close the connection to the db
		db.close();
	});

});


//add data 
//add a new item - using HTTP POST method
app.post('/invoices', (request, response, next) => {
	//access the form fields by the same names as in the HTML form
	const OrderID = request.body.Order_id;
	//console.log(OrderID);
	const FType = request.body.Type;
	const OrderOccasion = request.body.Occasion;
	const FColor = request.body.Color;
	let FPrice = request.body.Price;
	//convert price to number
	FPrice = parseFloat(FPrice);

	mongoClient.connect(mongoServerURL, (err, db) => {
		if (err)
			console.log("Cannot connect to Mongo:"+err.message);

		//connect to invoicedb
		const flowerdb = db.db("invoicedb");
		
		const newInvoice = {Order_id:OrderID, Type:FType,Occasion:OrderOccasion,Color:FColor,Price:FPrice};
		//insert to collection
		flowerdb.collection("invoices").insertOne(newInvoice, (err, result) => {
			if (err) {
				console.log(err.message);
			}

			if (result.insertedCount == 1) {
				//one way - return response - let client handle it
				//response.end("Item " + itemName + " added successfully!");
				
				//another way - redirect to the all items page - showing item added
				response.redirect("/static/index.html");
			}
			else
				response.end("Invoice" + Order_id + " could not be added!!");

			//response.send(JSON.stringify(newItem));
		});

		//close the connection to the db
		db.close();
	});	
});


// update 
app.put('/invoices', (request, response, next) => {
	console.log("in PUT");
	const OrderID = request.param('Order_id');
	const FType = request.param('Type');
	const OrderOccasion = request.param('Occasion');
	const FColor = request.param('Color');
	let FPrice = request.param('Price');
	//convert price to number
	FPrice = parseFloat(FPrice);

	mongoClient.connect(mongoServerURL, (err, db) => {
		if (err)
			console.log("Cannot connect to Mongo:"+err.message);

		//connect to invoicedb
		const flowerdb = db.db("invoicedb");
		
	
		//we are updating by the item_name
		const updateFilter = {Order_id:OrderID};
		const updateValues = {$set:{Type:FType,Occasion:OrderOccasion,Color:FColor,Price:FPrice}};
		
		flowerdb.collection("invoices").updateOne(updateFilter,updateValues, (err, result) => {
			if (err) {
				console.log(err.message);
			}
				
			//another way - redirect to the all items page - showing item added
			response.redirect("/static/index.html");
			
		});

		//close the connection to the db
		db.close();
	});	
});

//delete item by item name
app.delete('/invoices', (request, response, next) => {
	const OrderID = request.param('Order_id');

	mongoClient.connect(mongoServerURL, (err, db) => {
		if (err)
			console.log("Cannot connect to Mongo:"+err.message);

			//connect to invoicedb
		const flowerdb = db.db("invoicedb");
		
		
		//we are deleting by the item_name
		const deleteFilter = {Order_id:OrderID};

		//insert from itemdb items collection
		flowerdb.collection("invoices").deleteOne(deleteFilter, (err, res) => {
			if (err) {
				console.log(err.message);
			}

	
			if (res.deletedCount > 0) {
				response.redirect("/static/index.html");
			}
			else {
				response.send("<script>alert(\"deleted \" +Order_id);</script>");
			}
		});

		//close the connection to the db
		db.close();
	});	
});





//set the route for static HTML files to /static
//actual folder containing HTML files will be public
app.use('/static', express.static('public'));

//start the web server
const port = process.env.PORT;
app.listen(port, ()=> {
	console.log("server listening on "+port);
});