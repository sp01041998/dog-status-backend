const express = require('express');
const app = express();
const mongoose = require("mongoose")
const cors = require('cors');

const dotenv = require('dotenv');

// Load .env file
dotenv.config();

app.use(cors({
    origin: 'https://dog-status-frontend.vercel.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'], 
  }));

// Middleware to parse JSON request bodies
app.use(express.json());


console.log(process.env.MONGO_URI)

mongoose.connect(process.env.MONGO_URI).then(res => {
    console.log("Mongodb running on port 27017")
}).catch(err => {
    console.log(err)
})

// Home route
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.use("/user", require("./src/route/userRoute"))
app.use("/image", require("./src/route/imageRoute"))




// Start the server
const PORT = 3003;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = {
    app
}