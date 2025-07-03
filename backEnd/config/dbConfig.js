const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_CONNECTION_URL).then(()=>{
    console.log('Connected to DB Successfully');
}).catch((err)=>{
    console.log('DB Connection Failed');
});