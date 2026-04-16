

const mongoose = require('mongoose');


const connect_db =  async () => { 

    try{ await mongoose.connect(process.env.MONGO_URI) 

        console.log('Connected to MongoDB successfully');
    }

    catch(err){
        console.error('MongoDB connection error:', err);
    }   


}

module.exports = connect_db;