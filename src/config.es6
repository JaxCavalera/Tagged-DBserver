import express from 'express';
import cors from 'cors';
import path from 'path';

/*
cors Cross-Origin Resource Sharing allows added security
It uses Headers to lock in communication between a website and server
the Origin is the port+url  this is all related to SSL
*/

// IMPORT enhancing modules such as session and content handling;
import bodyParser from 'body-parser';
import multer from 'multer';

//   Multipart/form-data processing configuration
const storage = multer.diskStorage({
    destination: './src/galleries',
    filename: function(req, file, cb) {
        cb(null, Date.now() + '_' + file.originalname);
    },
});

const upload = multer({storage: storage});

//  Session must be imported AFTER bodyparser etc
import session from 'express-session';

//  Replaces var PostgreSqlStore = require('connect-pg-simple')(session);
import pgStore from 'connect-pg-simple';
const PostgreSqlStore = pgStore(session);

const dbserver = express();
const sessionOptions = {
    store: new PostgreSqlStore({
        conString: 'postgres://'
        + process.env.TAGGED_CONNECTION_USER + ':'
        + process.env.TAGGED_CONNECTION_PASS + '@'
        + process.env.TAGGED_CONNECTION_HOST + ':'
        + process.env.TAGGED_CONNECTION_PORT + '/'
        + 'tagged',
        tableName: 'session_store',
    }),
    secret: process.env.TAGGED_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 86400000},//24 hours = 86400000
};

//  Import DB Query Functions
import {regAble, regRun} from './auth/register.es6';// regAble(username) returns 'success'/'fail'
import {logRun} from './auth/login.es6';// logRun(username, password) returns 'success'/'fail'
import {galleryUp, galleryDown, imgDbLookup} from './auth/gallery.es6';// galleryUp(file, name, uuid) same as ^
import {sessStatus} from './auth/session.es6';// TEMPLATE ONLY

//  Cross-Origin Resource Sharing  Options
const whiteList = process.env.ORIGIN_WHITELIST;
const corsOptions = {
    origin: function(origin, callback) {
        var originIsWhitelisted = whiteList.indexOf(origin) !== -1;
        callback(null, originIsWhitelisted);
    },

    credentials: true,
};

//  Configure the modules that the server code will use
dbserver.use(bodyParser.urlencoded({extended: true}));//    x-www-form-urlencoded procesing
dbserver.use(bodyParser.text());
dbserver.use(bodyParser.json());//  JSON processing
dbserver.use(session(sessionOptions));

//  =====   Request Routing   =====
/*
Routes are the ('/route-goes-here') part
They should be identical to the server-side route listed
In the Client-Side code.
*/

//  =====  REGISTER ROUTE  =====
//  Enable pre-flight request for register route
//  Pre-flight allows requests with a custom header / body Init
dbserver.options('/register', cors(corsOptions));

//  =====  listen for post requests to the '/register' route  =====
dbserver.post('/register', cors(corsOptions), function(req, res) {
    let myReq = req.body;
    let unameValue = myReq.username;
    /*
    Promises .then and .catch only delay processing things inside their "("<delayed>")"
    inside a promise it will only do one of the following things :
    - Return a Value
    - Return a Value that's passed onto a chained Promise
    - Throw an Error
    */
    return regAble(unameValue)
    .then((result) => {
        console.log('Register Check : ', result);
        let regAbleResult = result;
        return regAbleResult;
    })

    //  if regAbleResult = fail the username is already taken
    .then((regAbleResult)=> {
        if (regAbleResult === 'success') {

            //  regRun should return "true" unless db connection fails
            // regrun adds the user to the db
            return regRun(myReq)
            .then((result)=> {
                if (result === 'success') {
                    // we need to add the 'user' & 'uuid' props to the session object in here
                    logRun(myReq)
                    .then((result)=> {
                        req.session.user = result[0].username;
                        req.session.uuid = result[0].uuid;
                        return res.json({regResult: 'success', sessionStatus: 'active', currentUser: req.session.user});
                    });
                }
            });
        } else {
            return res.json({regResult: 'fail', sessionStatus: 'none', currentUser: ''});
        }
    })
    .catch((error) => {
        return console.log(error);
    });
});

//  ==================================================

//  =====  LOGIN ROUTE  =====
dbserver.options('/login', cors(corsOptions));

dbserver.post('/login', cors(corsOptions), function(req, res) {
    let myReq = req.body;
    return logRun(myReq)
    .then((result)=> {
        if (result[0].username === myReq.username) {
            console.log('Login Attempt for ' + result[0].username + ' : Success');

            // we need to add a 'user' and 'uuid' prop to the session object in here
            req.session.user = result[0].username;
            req.session.uuid = result[0].uuid;
            return res.json({logResult: 'success', sessionStatus: 'active', currentUser: req.session.user});
        } else {
            return res.json({logResult: 'fail', sessionStatus: 'none', currentUser: ''});
        }
    })
    .catch((error) => {
        return console.log(error);
    });
});

//  ==================================================

//  =====  SESSION STATUS ROUTE  =====
dbserver.options('/sessionStatus', cors(corsOptions));

dbserver.post('/sessionStatus', cors(corsOptions), function(req, res) {
    if (!req.session.user) {
        console.log('no active session found');
        return res.json({sessionStatus: 'none', currentUser: ''});
    } else {
        console.log('active session found');
        return res.json({sessionStatus: 'active', currentUser: req.session.user});
    }
});

//  ==================================================

//  =====  LOGOUT ROUTE  =====
dbserver.options('/logout', cors(corsOptions));

dbserver.post('/logout', cors(corsOptions), function(req, res) {
    if (!req.session.user) {
        console.log('no active session found');
        return res.json({sessionStatus: 'none', currentUser: ''});
    } else {
        console.log('logging ' + req.session.user + ' out of their session');
        req.session.destroy();
        return res.json({sessionStatus: 'none', currentUser: ''});
    }
});

//  ==================================================
//          =====  START  OF  GALLERY  =====
//  ==================================================

//  =====  GALLERY UPLOAD ROUTE  =====
dbserver.post('/galleryUpload', cors(corsOptions), upload.single('file'), function(req, res) {
    if (!req.session.user) {
        console.log('Session Expired');
        return res.send('Session Expired');
    } else {
        console.log('Upload Details : ', req.file, req.body);

        //  Run database function to save the request data
        //  Use the req.session.uuid for inserting
        galleryUp(req.file.path.substring(4), req.body.imageName, req.session.uuid)
        .then((result) => {
            console.log(result);
            return res.send(result);
        })
        .catch((error) => {
            console.log('There was a problem ', error);
        });
    }
});

//  ==================================================

//  =====  IMAGE ROUTE FOR CLIENT REQUESTS  =====
dbserver.post('/galleryDownload', cors(corsOptions), upload.single('file'), function(req, res) {
    if (!req.session.user) {
        console.log('Session Expired');
        return res.send('Session Expired');
    } else {

        console.log('download path found');

        //  Run database function to get a list of image sources matching
        //  The current req.session.uuid
        galleryDown(req.session.uuid)
        .then((result) => {
            console.log(result);
            return res.json(result);
        })
        .catch((error) => {
            console.log('There was a problem ', error);
        });
    }
});

//  ==================================================

//  =====  IMAGE ROUTE FOR CLIENT REQUESTS  =====
dbserver.get('/galleries/*', function(req, res) {
    imgDbLookup(req.originalUrl.substring(1).replace('/', '\\'))
    .then((result) => {
        if (req.session.uuid === result[0].uuid) {
            res.sendFile(req.originalUrl, {root: './src/'});
        } else {
            res.send('access denied');
        }
    });
});

//  ==================================================
//           =====  START  OF  SERVER  =====
//  ==================================================

const server = dbserver.listen(3000, function() {
    const host = server.address().address;
    const port = server.address().port;

    console.log('listening at : http://' + host + ':' + port);
});
