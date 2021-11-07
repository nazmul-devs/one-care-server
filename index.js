const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const { MongoClient } = require("mongodb");

const port = 5000;
app.use(cors());
app.use(express.json());

// mongodb connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.f4mgp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

async function run() {
	try {
		await client.connect();
		const database = client.db("oneCareDoctors");
		const apoinmentCollection = database.collection("appoinments");
		const usersCollection = database.collection("users");

		// post appoinment data to database
		app.post("/appoinment", async (req, res) => {
			const appoinment = req.body;
			const result = await apoinmentCollection.insertOne(appoinment);
			res.json(result);
		});

		// get appoinment data from database by email and date
		app.get("/appoinment", async (req, res) => {
			const email = req.query.email;
			const date = req.query.date;
			const result = await apoinmentCollection
				.find({ email: email, date: date })
				.toArray();
			res.send(result);
		});
		// save user from clyent site
		app.post("/users", async (req, res) => {
			const user = req.body;
			const result = await usersCollection.insertOne(user);
			res.json(result);
			console.log(result);
		});
	} finally {
		// await client.close();
	}
}
run().catch(console.dir);
// get app
app.get("/", (req, res) => {
	res.send("One care server is running");
});

// lisening app
app.listen(port, () => {
	console.log("server running with ", port);
});
