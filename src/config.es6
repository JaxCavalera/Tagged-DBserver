import express from 'express';
import methodOverride from 'method-override';

//  ===== Database Related Imports =====
import promise from 'bluebird';
let options = {promiseLib: promise};

import pgprom from 'pg-promise';
let pgp = pgprom(options);

import monitor from 'pg-monitor';

monitor.attach(options);

//	database connection details
const cn = {
    host: 'localhost', // server name or IP address;
    port: 5432,
    database: 'tagged',
    user: 'postgres',
    password: 'password',
};

//	set "db" as the database object
const db = pgp(cn);

// import cors from 'cors';
import bodyParser from 'body-parser';
import multer from 'multer';
const upload = multer();//   Multipart/form-data processing

const dbserver = express();

//  Import DB Query Functions
import {regAble, regRun} from './auth/register.es6';// regable(username) returns bool

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
    let unameValue = myReq.username.toLowerCase();
    regAble(unameValue).then(console.log(regAble));

    // if (regAbleTest === false) {
    //     return res.json({status: 'That Username Is Taken'});
    // }

    // else {
    //     regRun(myReq);
    //     return res.send({status: (myReq.username, ' Successfully Registered')});
    // }
});

const server = dbserver.listen(3000, function() {
    const host = server.address().address;
    const port = server.address().port;

    console.log('listening at : http://' + host + ':' + port);
});
