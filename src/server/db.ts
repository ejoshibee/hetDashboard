import mysql from 'mysql2/promise';

const pool = mysql.createPool({
	host: process.env.DBHOST,
	user: process.env.DBUSER,
	password: process.env.DBPASSWORD,
	database: process.env.DBDATABASE,
});

export default pool;