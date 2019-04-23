const express = require('express');
const mongoose = require('mongoose');
const ejs = require('ejs');
const bodyparser = require('body-parser');
const path = require('path');
const cookieparser = require('cookie-parser');
const passport = require('passport');
// const session = require('express-session');
// const sec = require('./setup/myurl').secret;

//bringing all routes
const comp = require('./routes/computer_emp');

const app = express();

//middleware (bodyparser configuration)
app.use(bodyparser.urlencoded({extended:false}));
app.use(bodyparser.json());

//passport configuration
app.use(passport.initialize());
app.use(passport.session());
//cookieparser config
app.use(cookieparser())

require('./strategies/jsonstrategy')(passport);


//mongodb configuration
const db = require('./setup/myurl').mongoURL;

//Attempt to connect to db
mongoose.connect(db, {useNewUrlParser: true})
    .then(() => console.log('MongoDB connected successfully..!!'))
    .catch(err => console.log(err));

const port = process.env.PORT || 5000;
app.get('/test', function(req, res){
    console.log('test');
    return res.json({ok:'ok'});
});
app.use('/', comp);
app.use('/', express.static(__dirname + '/public'));
app.listen(port, () => console.log(`app is running at: ${port}`));