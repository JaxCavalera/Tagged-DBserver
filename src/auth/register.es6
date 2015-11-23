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

export function regAble(uname) {
    db.query('SELECT * FROM users WHERE username = ${name}', {
        name: uname,
    })
    .then(function(data) {
        console.log('Username is Available ', data);
        return true;
    })
    .catch(function(error) {
        console.log('Choose a New Username or Login', error);
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
