// 引入 mysql2
const mysql = require("mysql2");

// 创建连接池
const pool = mysql.createPool({
  host: "localhost",
  port: 3306,
  user: "root", // MySQL 用户名
  password: "123456lxz", // MySQL 密码
  database: "tracker", // 你要连接的数据库
  waitForConnections: true,
  connectionLimit: 10, // 最大连接数
  queueLimit: 0,
});

// 返回连接池对象
exports.pool = pool;

class Connections {
  find(search = "*", table, condition, params) {
    return new Promise((resolve, reject) => {
      let sql = `SELECT ${search} FROM ${table} WHERE ${condition}`;
      pool.query(sql, params, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }
  insert(table, condition, params) {
    return new Promise((resolve, reject) => {
      const str = "?";
      let _ = str.repeat(condition.split(",").length);
      let val = Array.from(_).toString();
      let sql = `INSERT INTO ${table}(${condition}) VALUES(${val})`;
      pool.query(sql, params, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
  update(table, val, condition, params) {
    return new Promise((resolve, reject) => {
      let sql = `UPDATE ${table} SET ${val} WHERE ${condition}`;
      pool.query(sql, params, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
  del(table, condition, params) {
    return new Promise((resolve, reject) => {
      let sql = `DELETE FROM ${table} WHERE ${condition}`;
      pool.query(sql, params, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
exports.db = new Connections();
