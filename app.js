require("dotenv").config();

const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser');

// token middleware
const tokenMiddleware = require('./middleware/verifyToken')

// custom routes
const adminRoutes = require("./routes/adminRoutes")
const usersRoutes = require("./routes/usersController")
const serverRoutes = require("./routes/serverRoutes")

// cors Settings
const corsOptions = {
    origin: '*',  
    methods: 'GET, POST, OPTIONS, PUT, PATCH, DELETE', 
    allowedHeaders: 'Authorization, Content-Type',
    optionsSuccessStatus: 200, 
};

// create express app
const app = express()

const HOST = process.env.API_HOST || 'localhost'
const PORT = process.env.API_PORT || '3888'

app.listen(PORT, HOST, () => {
    console.log(`Server running http://${HOST}:${PORT}`);
})

// add cors settings
app.use(cors(corsOptions))

app.use(bodyParser.urlencoded({ extended: true })); // for form-data
app.use(bodyParser.json()) // for JSON


// verify token at any request
app.use(tokenMiddleware)

// default route
app.get("/", (req, res) => {
    return res.status(200).json({
        "Status": 200
    })
})

// define custom routes here
app.use('/admin', adminRoutes)
app.use('/users', usersRoutes)
// app.use('/server', serverRoutes)