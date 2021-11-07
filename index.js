const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const app = express();
require("dotenv").config();
const { MongoClient } = require("mongodb");

// firebase idtoken
const serviceAccount = require("./one-care-family-doctors.json");

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
});

const port = 5000;
app.use(cors());
app.use(express.json());

// mongodb connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.f4mgp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

// token varify
async function varifyToken(req, res, next) {
	if (req.headers?.authorization?.startsWith("Bearer ")) {
		const token = req.headers.authorization.split(" ")[1];

		try {
			const decodetUser = await admin.auth().verifyIdToken(token);
			req.decodetEmail = decodetUser.email;
		} catch {}
	}
	next();
}
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
		app.get("/appoinment", varifyToken, async (req, res) => {
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
		});

		// upsert user
		app.put("/users", async (req, res) => {
			const user = req.body;
			const filter = { email: user.email };
			const options = { upsert: true };
			const updateDoc = { $set: user };
			const result = await usersCollection.updateOne(
				filter,
				updateDoc,
				options
			);
			res.json(result);
		});
		// set admin
		app.put("/users/admin", varifyToken, async (req, res) => {
			const user = req.body;
			const requister = req.decodetEmail;
			if (requister) {
				const requisterAccount = await usersCollection.findOne({
					email: requister,
				});
				if (requisterAccount.role === "admin") {
					const filter = { email: user.email };
					const updateDoc = { $set: { role: "admin" } };
					const result = await usersCollection.updateOne(
						filter,
						updateDoc
					);
					res.json(result);
				} else {
					res.status(403).json({ message: "you do not have access" });
				}
			}
		});
		// check admin rule
		app.get("/users/:email", async (req, res) => {
			const userEmail = req.params.email;
			const result = await usersCollection.findOne({ email: userEmail });
			let isAdmin = false;
			if (result?.role === "admin") {
				isAdmin = true;
			}
			res.json({ admin: isAdmin });
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
