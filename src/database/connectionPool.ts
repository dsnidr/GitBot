import mysql, { Connection } from "mysql2/promise";
import keys from "../config/keys";

// TODO: Logging

const pool = mysql.createPool({
	host: keys.MYSQL.HOST,
	user: keys.MYSQL.USER,
	password: keys.MYSQL.PASSWORD,
	database: keys.MYSQL.DATABASE,
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0
});

export default pool;
