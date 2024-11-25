const http = require("http");
const redisClient = require('./redisClient'); // 导入 Redis 客户端
const hostname = "127.0.0.1";
const port = 3000;

// 创建服务器
const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json"); // 设置响应头为 JSON 格式

  // 根据不同的 URL 路径返回不同的内容
  if (req.url === "/user") {
    res.end(JSON.stringify({ name: "John", age: 30 }));
    return;
  }
  res.end(JSON.stringify({ message: "Not Found" }));
});

// 监听指定端口和主机名
server.listen(port, hostname, () => {
  console.log(`服务器运行在 http://${hostname}:${port}/`);
});




