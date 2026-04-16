require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;
const profileRoutes = require('./router/profiles');
const connect_db = require('./db');

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

app.use('*splat', (req, res) => {
    return res.status(404).json({
        status: "error",
        message: "Endpoint not found"
    });
});



const start = async () => {


    await connect_db();
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

start();

module.exports = app;
// API endpoint to create data      

