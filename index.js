const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = 5000;
app.use(cors());
app.use(express.json());

// get app
app.get("/", (req, res) => {
	res.send("One care server is running");
});

// lisening app
app.listen(port, () => {
	console.log("server running with ", port);
});
