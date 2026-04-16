

// const mongoose = require('mongoose');


// const connect_db =  async () => { 

//     try{ await mongoose.connect(process.env.MONGO_URI) 

//         console.log('Connected to MongoDB successfully');
//     }

//     catch(err){
//         console.error('MongoDB connection error:', err);
//     }   


// }

// now we have to go serverless.


const mongoose = require('mongoose');

let isConnected = false;

const connect_db = async () => {
    if (isConnected) {
        return;
    }

    try {
        const db = await mongoose.connect(process.env.MONGO_URI);

        isConnected = db.connections[0].readyState === 1;

        console.log("✅ Database connected");
    } catch (error) {
        console.error("❌ DB connection error:", error);
        throw error;
    }
};


module.exports = connect_db;