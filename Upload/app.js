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

let imageSchema = new mongoose.Schema({
    imageUrl : String,
})

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
    Picture.find({})
     .then(images=>{
         res.render('index', {images: images});
     })
    
})

//Single upload
let storage = multer.diskStorage({
    destination: './public/uploads/images',
    filename: (req, file, cb)=>{
        cb(null,file.originalname);
    }
});

let upload = multer({
    storage: storage,
    fileFilter: (req, file, cb)=>{
        checkFileType(file,cb);
    }
})


function checkFileType(file, cb){
    let fileType = /jpg|jpeg|png|gif/;
    let extname = fileType.test(path.extname(file.originalname).toLowerCase());

    if(extname){
        return cb(null,true);
    }
    else {
        return cb('Please select image file only');
    }
}


app.post('/uploadsingle', upload.single('singleImage'), (req,res,next)=>{
    const file = req.file;

    if(!file){
        return console.log("Please select a Image file");
    }

    let url = file.path.replace('public', '');

    Picture.findOne({ imageUrl: url })
        .then(img =>{
            if(img){
                console.log('Image already exists');
             return res.redirect('/upload');
            }

            Picture.create({ imageUrl: url })   
            .then(img=>{
                console.log('Image succesfully saved!');
                res.redirect('/');
            })

        })

        .catch(err=>{
            console.log(err);
        });
});

//MULTIPLE images
app.post('/uploadmultiple', upload.array('multipleImages'),(req,res,next)=>{
    const files = req.files;

    if(!files){
        return console.log('Please select images')
    }

    files.forEach(file=>{
        let url = file.path.replace('public', '');
        Picture.findOne({ imageUrl : url})
         .then(async img=>{
             if(img){
                 return console.log('Duplicate image');
                 
             }

            await Picture.create({ imageUrl : url });
         })
         .catch(err =>{
                return console.log(err);
         })
    });
    res.redirect('/');

})

const port = process.env.PORT;
app.listen(port, ()=>{
    console.log("Server created!");
})
