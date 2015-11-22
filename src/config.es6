import express from 'express';

import bodyParser from 'body-parser';
import multer from 'multer';
const upload = multer();//   Multipart/form-data processing

//  ===== Database Related Imports =====
import promise from 'bluebird';
let options = {promiseLib: promise};

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

const dbserver = express();

//  Configure how to respond to handle requests
dbserver.use(bodyParser.json());//  JSON processing
dbserver.use(bodyParser.urlencoded({extended: true}));//    x-www-form-urlencoded procesing

dbserver.post('/', function(req, res) {
    let myReq = req.body;
    var requestType = req.get('Content-Type');
    console.log(requestType);
    return res.json(myReq);
});

const server = dbserver.listen(3000, function() {
    const host = server.address().address;
    const port = server.address().port;

    console.log('listening at : http://' + host + ':' + port);
});
