require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;
const profileRoutes = require('./router/profiles');
const connect_db = require('./db');
const serverless = require('serverless-http');

// const corsConfig = {
    
// }
// Middleware
app.use(cors({
    method: ['GET', 'POST', 'PUT', 'DELETE'],
    origin: "*"    
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes

app.use('/api/profiles', profileRoutes);

// because of serverless with vercel, let's comment this line

/*app.use('*splat', (req, res) => {
    return res.status(404).json({
        status: "error",
        message: "Endpoint not found"
    });
});
*/
//..............................

app.use((req, res) => {
    res.status(404).json({
        status: "error",
        message: "Endpoint not found"
    });
});

// my normal traditional server start code

// const start = async () => {


//     await connect_db();
//     app.listen(PORT, () => {
//         console.log(`Server is running on port ${PORT}`);
//     });
// }

// start();

// let's go serverless

// 🔑 Connect DB once (important for serverless)
let isConnected = false;

const connectOnce = async () => {
    if (!isConnected) {
        await connect_db();
        isConnected = true;
    }
};

// 🔑 Export handler for Vercel
module.exports = async (req, res) => {
    await connectOnce();
    return app(req, res);
};


// API endpoint to create data      

