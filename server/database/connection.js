import mysql from 'mysql';
import dotenv from 'dotenv';
dotenv.config();

const dbConfig={
    host:process.env.HOST,
    user:process.env.DB_USERNAME,
    password:process.env.DB_PASSWORD,
    database:'filmflick',
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
