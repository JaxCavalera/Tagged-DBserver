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

//  Check if the username is taken or not and return false if it's taken
export function regAble(uname) {
    db.query('SELECT * FROM users WHERE username = ${name}', {
        name: uname,
    })
    .then(function(data) {
        if (data !== {}) {
            console.log('Username is Unavailable');
            return false;
        } else {
            console.log('Username is Available');
            return true;
        }
    })
    .catch(function(error) {
        console.log('there was an error in the query logic');
        return false;
    });
}

//  Register the username and password
export function regRun(regDetailsObj) {
    //  Extracting username and password into variables
    const uname = regDetailsObj.username;
    const pword = regDetailsObj.password;

    db.query('INSERT INTO users (username, password) VALUES (${name}, crypt(${pass}, gen_salt(md5)))', {
        name: uname,
        pass: pword,
    })
    .then(function() {
        console.log(uname, ' successfully registered');
        return true;
    })
    .catch(function(error) {
        console.log('there was an error in the query logic');
        return false;
    });
}

/*
get the username
get the password

select * from db where username matches

if no matches, then run a query to add those details
as a new entry to the database

if there is a match then return 'Choose a New Username or Login'
*/
