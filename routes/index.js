var express = require("express");
var router = express.Router();
const axios = require("axios");
const { pool, db } = require("../src/db");

// 小程序
const APPID = "wxa1df5197cd53e10d";
const APPSECRET = "733c41b4a3d602e0c654daccf2078728";

let accessToken = null;
let tokenExpiresAt = 0;

router.get("/", async function (req, res, next) {
  res.send("welcome");
});
router.get("/get-tracker-list", async function (req, res, next) {
  getTracker((results) => {
    res.send(results);
  });
});
router.get("/get-tracker-detail", async function (req, res, next) {
  const { id } = req.query;
  getTrackerById(id, (results) => {
      res.send(results||null);
  });
});

router.post("/edit-tracker", async function (req, res, next) {
  const { id, tracker_img } = req.body;
  const detail = await getTrackerById(id);
  console.log(detail);
  
  if (!detail) {
    res.send({ message: "没有找到该记录" });
  }
  const tracker_img_arr = detail.tracker_img
    ? detail.tracker_img.split(",")
    : [];
  tracker_img_arr.push(tracker_img);
  if (tracker_img_arr.length > 5) {
    res.send({ message: "图片数量不能超过5张" });
    return
  }

  await db.update(
    "tracker",
    `tracker_img='${tracker_img_arr.join(",")}'`,
    `id=${id}`
  );
  res.send({ code: 1 });
});

router.get("/get-miniprogram-code", async (req, res) => {
  const { id } = req.query;
  try {
    // 获取 access_token
    const token = await getAccessToken();
    // 调用目标接口
    const apiUrl = `https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${token}`;
    const requestData = {
      scene: id,
      width: 720,
      check_path: false,
      page: "pages/dynamic-photo/tracker",
      env_version: "trial",
    };
    const response = await axios.post(apiUrl, requestData, {
      responseType: "arraybuffer",
    });
    const tx = Buffer.from(response.data, "binary").toString("base64");
    res.send({ success: true, data: tx });
  } catch (err) {
    console.error("Error calling Mini Program API:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/get-nfc-scheme", async (req, res) => {
  try {
    // 获取 access_token
    const token = await getAccessToken();

    // 调用目标接口，例如获取 NFC 的小程序 scheme
    const apiUrl = `https://api.weixin.qq.com/wxa/generatenfcscheme?access_token=${token}`;
    const requestData = {
      jump_wxa: {
        path: "/pages/index/index",
        query: "",
      },
      model_id: "xxx",
    };

    const response = await axios.post(apiUrl, requestData);
    res.send({ success: true, data: tx });
  } catch (err) {
    console.error("Error calling Mini Program API:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 获取 access_token 的函数
async function getAccessToken() {
  if (accessToken && Date.now() < tokenExpiresAt) {
    return accessToken; // 如果未过期，直接返回
  }

  const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${APPSECRET}`;
  try {
    const response = await axios.get(url);
    if (response.data.access_token) {
      accessToken = response.data.access_token;
      tokenExpiresAt = Date.now() + response.data.expires_in * 1000; // 保存过期时间
      return accessToken;
    } else {
      throw new Error("Failed to get access_token");
    }
  } catch (err) {
    console.error("Error fetching access_token:", err.message);
    throw err;
  }
}
// 获取所有tracker
const getTracker = async (callback = () => {}) => {
  try {
    const results = await db.find(
      "id, tracker_img, video_src, title",
      "tracker",
      "is_show = 1"
    );
    callback(results);
  } catch (err) {
    console.error("查询失败: ", err);
    return callback(err);
  }
};
// 根据ID获取tracker
const getTrackerById = async (id, callback = () => {}) => {
  try {
    const results = await db.find(
      "id, tracker_img, video_src, title",
      "tracker",
      "id = ?",
      [parseInt(id)]
    );


    callback(results[0]);
    return results[0];
  } catch (err) {
    console.error("查询失败: ", err);
    callback(err);
    return false;
  }
};

module.exports = router;
