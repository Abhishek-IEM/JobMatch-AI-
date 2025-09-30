const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then((res)=>{
    console.log("Database Connected Successfully");
}).catch(err=>{
    console.log("Something Error",err);
})

// as6119552_db_user
// Aryan2007@
// mongodb+srv://as6119552_db_user:Aryan2007@@cluster0.wujaizr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0