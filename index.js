const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv').config();
const authRoutes = require('./src/routes/authRoute');

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(cookieParser());

mongoose.connect('mongodb://localhost:27017/auth').then(() => {
    console.log('DB is connected');
}).catch((e) => {
    console.log(`${e}`);
});

app.get('/', (req, res) => {
    res.status(200).send('Welcome to NodeJS App');
});
app.get('/api', (req, res) => {
    res.status(200).send('API is working.');
});
app.use('/api/users', authRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
});