const express = require('express');
const app = express();
const dotenv = require('dotenv');
const path = require('path');

const databaseConnect = require('./config/database')
const authRouter = require('./routes/authRoute')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const messengerRoute = require('./routes/messengerRoute')

dotenv.config({
    path: 'backend/config/config.env'
})

app.use(bodyParser.json());
app.use(cookieParser());
app.use('/api/messenger', authRouter);
app.use('/api/messenger', messengerRoute);

const PORT = process.env.PORT || 5000
app.get('/', (req, res)=> {
    res.send('This is from backend - Chat App Group 01 DSCC')
})

databaseConnect();

app.use(express.static("./frontend/build"));
app.get("*", (req,res) =>{
    res.sendFile(path.resolve(__dirname,"frontend", "build", "index.html"))
});

app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
})