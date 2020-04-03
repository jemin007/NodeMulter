const express = require('express');
const app = express();
const path = require('path');
const multer = require('multer');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('fs'); //helps to delete files and pictures
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');


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

  //middleware for flash
  app.use(flash());

app.set('views', path.join);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));

//middleware for express session
app.use(session({
    secret: 'nodejs',
    resave: true,
    saveUninitialized: true
   
  }))

  //setting messages for flash globally
  app.use((req,res,next)=>{
    res.locals.success_msg = req.flash(('success_msg'));
    res.locals.error_msg = req.flash(('error_msg'));
    next();
})



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
                req.flash('success_msg','Image succesfully saved!')
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

});

app.delete('/delete/:id', (req,res)=>{
    let searchQuery = {_id: req.params.id};

    Picture.findOne(searchQuery)
     .then(img=>{
        fs.unlink(__dirname+'/public/'+img.imageUrl, (err)=>{
            if(err) return console.log(err);

            Picture.deleteOne(searchQuery)
             .then(img=>{
                 res.redirect('/');
             })
             .catch(err=>{
                 console.log(err);
             })
        })
     })

     .catch(err=>{
         console.log(err);
     })
})

const port = process.env.PORT;
app.listen(port, ()=>{
    console.log("Server created!");
})
