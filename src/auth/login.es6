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

//  Attempt matching the username and password
export function logRun(logDetailsObj) {
    monitor.attach(options);

    //  Extracting username and password into variables
    const uname = logDetailsObj.username;
    const pword = logDetailsObj.password;

    return db.query('SELECT uuid, username FROM users WHERE username = ${name} AND password = crypt(${pass}, password)', {
        name:   uname,
        pass:   pword,
        md5:    'md5',
    })
    .then(function(result) {
        if (result.length > 0) {
            monitor.detach(options);
            return result;
        } else {
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
