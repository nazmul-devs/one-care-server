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

console.log(uri);
const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

// get app
app.get("/", (req, res) => {
	res.send("One care server is running");
});

// lisening app
app.listen(port, () => {
	console.log("server running with ", port);
});
