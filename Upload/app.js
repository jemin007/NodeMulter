const express = require('express');
const app = express();
const path = require('path');
const multer = require('multer');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const methodOverride = require('method-override');


dotenv.config({path: './config.env'});

mongoose.connect(process.env.DATABASE_LOCAL,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})

let imageSchema = new mongoose.Schema(
    imageUrl = String
)

let Picture = mongoose.model('Picture', imageSchema);

app.set('views', path.join);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));

app.use(methodOverride('_method'));

app.get('/upload',(req,res)=>{
    res.render('upload');
})

app.get('/', (req,res)=>{
    res.render('index')
})

const port = process.env.PORT;
app.listen(port, ()=>{
    console.log("Server created!");
})
