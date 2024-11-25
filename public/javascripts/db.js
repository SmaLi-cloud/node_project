// 引入 mysql2
const mysql = require('mysql2');

// 创建连接池
const pool = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root', // MySQL 用户名
    password: '123456lxz', // MySQL 密码
    database: 'tracker', // 你要连接的数据库
    waitForConnections: true,
    connectionLimit: 10,      // 最大连接数
    queueLimit: 0,
  });

// 返回连接池对象
module.exports = pool;



