const mongoose = require('mongoose');

const connectDB = async() =>{
    try{
        const conn = await mongoose.connect(process.env.DATABASE_URI)
        console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold)
    }
    catch(error){
        console.error(`Error: ${error.message}`.red.underline.bold)
        throw error
    }
   
}

module.exports = connectDB