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

//  Add details about the current Gallery Upload Image
export function galleryUp(file, name, uuid) {
    console.log('file :' + file);
    console.log('name :' + name);
    console.log('uuid :' + uuid);

    monitor.attach(options);

    return db.query('INSERT INTO images (uuid, img_name, img_src) VALUES (${uuid}, ${name}, ${src})', {
        uuid:   uuid,
        name:   name,
        src:    file,
    })
    .then(function() {
        console.log('Image was added to Database');
        monitor.detach(options);
        return 'success';
    })
    .catch(function(error) {
        console.log('there was an error in the query logic: ', error);
        monitor.detach(options);
        return 'fail';
    });
}
