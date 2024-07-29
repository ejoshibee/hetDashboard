/* eslint-disable no-undef */
import { config } from 'dotenv';
import mysql from 'mysql2/promise';

config({ path: '.env' });

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  connectionLimit: 10, // Limit the number of simultaneous connections
  queueLimit: 0, // Unlimited queue
  waitForConnections: true, // Wait for available connection
  connectTimeout: 10000, // Connection timeout in milliseconds
  acquireTimeout: 10000, // Acquire timeout in milliseconds
  ssl: {
    rejectUnauthorized: false // Use SSL but don't reject self-signed certificates
  },
});

// Wrapper function for database queries
export async function query(sql, params) {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.query(sql, params);
    return rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

export default pool;