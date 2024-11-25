const redis = require("redis");
const axios = require("axios");

// 创建 Redis 客户端
const client = redis.createClient({
  socket: {
    host: "anjieli-dev.redis.rds.aliyuncs.com",
    port: 6379,
  },
  password: "d3gM3ZD4ed2gYjW",
  database: 1, // 指定数据库
});
// 处理连接错误
client.on("error", (err) => {
  console.error("Redis 连接错误:", err);
});

client.on("connect", async (err) => {
  console.log("Redis 连接成功");
});
async function getToken(phone) {
  try {
    // 发送请求以获取验证码
    await axios.post("https://api.leixiaoan.com/api/v1/auth/login-send-sms", {
      phone: phone
    });

    // 连接成功时
    const redisConnect = await client.connect(); // 连接到 Redis
    // 获取 Redis 中的数据
    const res = await redisConnect.get(`ajl_lxa_smsCaptcha:${phone}`);
    if (res) {
      const verificationCode = JSON.parse(res).captcha;
      // 发送请求以获取 token
      const response = await axios.post(
        "https://api.leixiaoan.com/api/v1/auth/login",
        {
          phone: phone,
          request_source: 1,
          captcha: verificationCode,
        }
      );
      if (response.data.code === 0) {
        const token = response.data.data.access_token;
        return token;
      }
      client.disconnect();
    } else {
      console.log("远程获取验证码失败");
      return null;
    }
  } catch (err) {
    console.error("操作时出错:", err);
    return null;
  }
}
// 调用函数
getToken(13939238798);
// console.log("^  ^\n'⚫'");
