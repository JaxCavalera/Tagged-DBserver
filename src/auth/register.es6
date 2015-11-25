//  ===== Database Related Imports =====
import promise from 'bluebird';
let options = {promiseLib: promise};

import pgprom from 'pg-promise';
let pgp = pgprom(options);

import monitor from 'pg-monitor';

//	database connection details
const cn = {
    host: process.env.TAGGED_CONNECTION_HOST,
    port: process.env.TAGGED_CONNECTION_PORT,
    database: 'tagged',
    user: process.env.TAGGED_CONNECTION_USER,
    password: process.env.TAGGED_CONNECTION_PASS,
};

//	set "db" as the database object
const db = pgp(cn);

//  Check if the username is taken or not and return false if it's taken
export function regAble(uname) {
    monitor.attach(options);
    return db.query('SELECT * FROM users WHERE username = ${name}', {
        name: uname,
    })
    .then((data) => {
        console.log('data =', data);
        if (data.length === 0) {
            console.log('Username is Available');
            return 'success';
        } else {
            console.log('Username is Unavailable');
            monitor.detach(options);
            return 'fail';
        }
    })
    .catch(function(error) {
        console.log('there was an error in the query logic');
        monitor.detach(options);
        return 'fail';
    });
}

//  Register the username and password
export function regRun(regDetailsObj) {

    //  Extracting username and password into variables
    const uname = regDetailsObj.username;
    const pword = regDetailsObj.password;

    return db.query('INSERT INTO users (username, password) VALUES (${name}, crypt(${pass}, gen_salt(${md5})))', {
        name:   uname,
        pass:   pword,
        md5:    'md5',
    })
    .then(function() {
        console.log(uname, 'successfully registered');
        monitor.detach(options);
        return 'success';
    })
    .catch(function(error) {
        console.log('there was an error in the query logic');
        monitor.detach(options);
        return 'fail';
    });
}
