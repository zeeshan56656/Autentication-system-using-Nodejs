const express =require('express');
const app = express();
const mongoose = require('mongoose');
const indexroute= require('./routes/index');
require('dotenv/config');
const bodyparser = require('body-parser');
const path = require('path');
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'))

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:true}));
mongoose.connect(process.env.DB_CONNECT,{ useUnifiedTopology: true,useNewUrlParser: true },()=>{
    console.log('connected to DB!');
})



app.use('/',indexroute);


app.listen(3000,()=>{
    console.log("server runing");
})
