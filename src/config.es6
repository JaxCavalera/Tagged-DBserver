import express from 'express';
import methodOverride from 'method-override';

// import cors from 'cors';
import bodyParser from 'body-parser';
import multer from 'multer';
const upload = multer();//   Multipart/form-data processing

const dbserver = express();

//  Import DB Query Functions
import {regAble} from './auth/register.es6';// regable(username) returns bool

// const corsOptions = {
//     origin: 'http://cxstudios.duckdns.org',
// };

//  Configure how to respond to handle requests
dbserver.use(bodyParser.urlencoded({extended: true}));//    x-www-form-urlencoded procesing
dbserver.use(bodyParser.text());
dbserver.use(bodyParser.json());//  JSON processing
dbserver.use(methodOverride());

dbserver.post('/register', function(req, res) {
    let myReq = JSON.parse(req.body);
    regAble(myReq.username.toLowerCase());
    res.send(myReq);
});

const server = dbserver.listen(3000, function() {
    const host = server.address().address;
    const port = server.address().port;

    console.log('listening at : http://' + host + ':' + port);
});
