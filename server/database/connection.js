import mysql from 'mysql2';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const dbConfig={
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync('./ca.pem')
  }
}
const connection= mysql.createConnection(dbConfig);
connection.connect((err)=>{
    if(err)console.log(err);
    else console.log('Mysql connected')
});

export function queryDatabase(query, params) {
    return new Promise((resolve, reject) => {
        connection.query(query, params, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
}

export default connection;
