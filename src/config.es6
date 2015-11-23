import express from 'express';
import methodOverride from 'method-override';

//  ===== Database Related Imports =====
import promise from 'bluebird';
let options = {promiseLib: promise};

import monitor from 'pg-monitor';

import pgprom from 'pg-promise';
let pgp = pgprom(options);

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

    let unameValue = myReq.username;

    //  Promises .then and .catch only delay processing things inside their "("<delayed>")"
    //  inside a promise it will only do one of the following things :
    //  - Return a Value
    //  - Return a Value that's passed onto a chained Promise
    //  - Throw an Error
    return regAble(unameValue)
    .then((result) => {
        console.log('regAble has resolved as ' + result);
        let regAbleResult = result;
        return regAbleResult;
    })

    //  if regAbleResult = false the username is already taken
    .then((regAbleResult)=> {
        if (regAbleResult === true) {
            //  regRun should return "true" unless db connection fails
            return regRun(myReq).then((result)=> res.send(result));
        } else {
            return res.send(false);
        }
    })
    .catch((error) => {
        return console.log(error);
    });

    // if (regAbleTest === false) {
    //     return res.json({status: 'That Username Is Taken'});
    // }

    // else {
    //     regRun(myReq);
    //     return res.send({status: (myReq.username, ' Successfully Registered')});
    // }
});

/*
dbserver.post('/register', function(req, res) {
    let myReq = JSON.parse(req.body);
    let unameValue = myReq.username.toLowerCase();
    regAble(unameValue)
      .then(function(result){
          console.log(result); //<-- should be either true or false
          return res.send(200, result);
      })
      .catch(function(err){
        return res.send(500, 'my bad, something terrible happened');
      })
});
*/

const server = dbserver.listen(3000, function() {
    const host = server.address().address;
    const port = server.address().port;

    console.log('listening at : http://' + host + ':' + port);
});
