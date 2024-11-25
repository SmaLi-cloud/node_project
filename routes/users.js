var express = require('express');
const axios = require('axios');

var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.get('/call-miniprogram-api', async (req, res) => {
  try {
      // 获取 access_token
      // const token = await getAccessToken();
      // 404a40f3c48d1642f7cf6823bd42d0e0
      // 调用目标接口，例如获取 NFC 的小程序 scheme
      const apiUrl = `https://api.weixin.qq.com/wxa/generatenfcscheme?access_token=122`;
      const requestData = {
          jump_wxa: {
              path: '/pages/start/index',
              query: 'key=value',
              env_version: 'release'
          },
          model_id: 'your-model-id',
      };

      const response = await axios.post(apiUrl, requestData);
      if (response.data.errcode === 0) {
          res.json({
              success: true,
              data: response.data
          });
      } else {
          res.json({
              success: false,
              error: response.data
          });
      }
  } catch (err) {
      console.error('Error calling Mini Program API:', err.message);
      res.status(500).json({ success: false, message: err.message });
  }
});



module.exports = router;
