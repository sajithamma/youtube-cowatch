const mongoose= require('mongoose');

const initDB=()=>{
    if(mongoose.connections[0].readyState){
        return;
    }
    mongoose.connect(process.env.URI,{
        useNewUrlParser:true,
        useUnifiedTopology:true
    })
    mongoose.connection.on("connected",()=>{
        console.log("connected to database");
    })
    mongoose.connection.on("error",(err)=>{
        console.log("connection error",err);
    })
}

module.exports= initDB;