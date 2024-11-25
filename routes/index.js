var express = require("express");
var router = express.Router();
const axios = require("axios");
const pool = require("../public/javascripts/db");

// 晓芳时光小程序
const APPID = "wxa1df5197cd53e10d";
const APPSECRET = "733c41b4a3d602e0c654daccf2078728";

// // 雷小安小程序
// const APPID=wx796c5036c40da68a
// const APPSECRET=6bf0d86930b0e1b0b5d26bf7434d2bfd

// 内存中保存 access_token，避免重复获取
let accessToken = null;
let tokenExpiresAt = 0;

/* GET home page. */
router.get("/", async function (req, res, next) {
  // 获取 access_token
  res.send({ a: 1 });
});
router.get("/get-tracker-list", async function (req, res, next) {
  getTracker((results) => {
    res.send(results);
  });
});
router.get("/get-tracker-detail", async function (req, res, next) {
  const { id } = req.query;
  getTrackerById(id, (results) => {
    if (results.length) {
      res.send(results[0]);
    } else {
      res.send(null);
    }
  });
});

router.get("/get-miniprogram-code", async (req, res) => {
  const { id } = req.query;
  try {
    // 获取 access_token
    const token = await getAccessToken();

    // 调用目标接口，例如获取 NFC 的小程序 scheme
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

// https://api.weixin.qq.com/wxa/generatenfcscheme?access_token=ACCESS_TOKEN
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
const getTracker = (callback) => {
  pool.query(
    "SELECT id, tracker_img, video_src, title FROM tracker WHERE is_show = 1",
    (err, results) => {
      if (err) {
        console.error("查询失败: ", err);
        return callback(err);
      }
      callback(results);
    }
  );
};
const getTrackerById = (id, callback) => {
  pool.query(
    `SELECT id, tracker_img, video_src, title FROM tracker WHERE id = ${parseInt(
      id
    )}`,
    (err, results) => {
      if (err) {
        console.error("查询失败: ", err);
        return callback(err);
      }
      callback(results);
    }
  );
};

module.exports = router;
