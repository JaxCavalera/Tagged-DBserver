import pgp from 'pg-promise';
import http from 'http';
import ip from 'ip';

//	node js webserver
const port = 8081;
const host = ip.address();

//	database connection details
const cn = {
    host: 'localhost', // server name or IP address;
    port: 5432,
    database: 'tagged',
    user: 'postgres',
    password: 'password'
};

//	set "db" as the database object
const db = pgp(cn);

//	Start the node webserver listening for GET requests
http.createServer(function (req, res) {
  if (req.method == 'GET') {
    returnUserList(req, res);
  }
}).listen(port, host);
