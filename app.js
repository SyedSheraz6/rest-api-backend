const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const multer = require('multer')

const feedRoutes = require('./routes/feed')

const app = express()

const MONGO_DB_URI = 'mongodb+srv://sherazsyed16:TwkxBkv21biHhcNA@cluster0.fwxks.mongodb.net/messages?retryWrites=true'

const fileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'images')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.originalname + '-' + uniqueSuffix)
    }
})
 
const filter = (req, file, cb) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

// middlewares
app.use(bodyParser.json())
app.use( multer( {storage: fileStorage, fileFilter: filter} ).single('image') )
app.use('/images', express.static(path.join(__dirname, 'images' )))

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    next()
})

// routes
app.use('/feed', feedRoutes)


app.use((error, req, res, next) => {
    console.log(error)
    const status = error.statusCode
    const message = error.message
    res.status(status).json({message:message})
})

mongoose.connect(MONGO_DB_URI)
.then((res) => {
    console.log('connected')
    app.listen(8080)
})
.catch(console)

