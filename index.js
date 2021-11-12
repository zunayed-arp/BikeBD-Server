const express = require('express')
require("dotenv").config();
const { MongoClient } = require('mongodb');
const app = express()
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 5000

// nicheDb
// t4lSgCMgyvYVlfS0


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ch3vz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

//middlewire

app.use(cors());
app.use(express.json());


async function run() {
	try {
		await client.connect();
		const database = client.db('niche_website');
		const productsCollection = database.collection('products')
		const usersCollection = database.collection('users');
		const orderCollection = database.collection('order')
		const reviewsCollection = database.collection('reviews') 


		app.get('/reviews', async (req, res) => {
			const reviews = await reviewsCollection.find({}).toArray();
			res.json(reviews);
		})



		app.get('/orders', async (req, res) => {
			const email = req.body;
			const orders = await orderCollection.find({}).toArray();
			res.json(orders);
		})


		app.get('/orders/:email', async (req, res) => {
			const email = req.params.email;

			// console.log('email', req.body)
			const query = { email: email };
			const orders = await orderCollection.find(query).toArray();
			res.json(orders)
		})

		app.get('/products', async (req, res) => {

			const cursor = await productsCollection.find({}).toArray();
			console.log(cursor);
			res.json(cursor)
		});

		app.get('/products/:id', async (req, res) => {
			const id = req.params.id;
			const query = { _id: ObjectId(id) };
			const product = await productsCollection.findOne(query);
			console.log('load user id:', id);
			res.json(product);
		});


		app.get('/users', async (req, res) => {
			const cursor = await usersCollection.find({}).toArray();
			console.log(cursor);
			res.json(cursor)
		});

		app.get('/users/:email', async (req, res) => {
			const email = req.params.email;
			const query = { email: email };
			console.log(email)
			const user = await usersCollection.findOne(query);
			let isAdmin = false;
			if (user?.role === 'admin') {
				isAdmin = true;
			}

			res.json({admin:isAdmin});

		});


		app.post('/reviews', async (req, res) => {
			const review = req.body;
			const result = await reviewsCollection.insertOne(review);
			res.json(result);
		});


		app.post('/book', async (req, res) => {
			const book = req.body;
			const result = await orderCollection.insertOne(book);
			res.json(result);
		});

		app.post('/users', async (req, res) => {
			const user = req.body;
			// console.log('user',req.body)
			const result = await usersCollection.insertOne(user);
			// console.log(result);

			res.json(result);

		});


		app.post('/addProducts', async (req, res) => {
			const products = req.body;
			console.log('products', req.body);
			const result = await productsCollection.insertOne(products);
			res.json(result);
		});


		app.put('/users', async (req, res) => {
			const user = req.body;
			const filter = { email: user.email };
			const options = { upsert: true };
			const updateDoc = { $set: user };
			const result = await usersCollection.updateOne(filter, updateDoc, options);
			console.log(result);
			res.json(result);
		});


		app.put('/users/admin', async (req, res) => {
			const email = req.body.email;

			const filter = { email: email };
			const updateDoc = {
				$set: { role: 'admin' }
			};
			const result = await usersCollection.updateOne(filter, updateDoc);
			res.json(result);
		})




		app.patch('/confirmation/:id', async (req, res) => {
			const id = req.params.id;
			const updateDoc = {
				$set: {
					status: 'Confirmed',
				}
			};
			const query = { _id: ObjectId(id) };
			const result = await orderCollection.updateOne(query, updateDoc);
			res.json(result.modifiedCount)
		})


		app.delete('/delete/:id', async (req, res) => {
			const id = req.params.id;
			const query = { _id: ObjectId(id) }
			const result = await orderCollection.deleteOne(query);
			res.json(result.deletedCount);
		})



	}
	finally {

	}
}
run().catch(console.dir)







app.get('/', (req, res) => {
	res.send("Niche Website Portal Running")
})

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`)
})