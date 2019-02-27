var express = require('express');
var router = express.Router();
var db = require('../dao/mssql');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

// 获取平台监控信息
router.post('/info', function (req, res, next) {
  console.log('request dashboard base info...');
  db.sp_getplayerinfo(req.body.playerid, function (err, result) {
    if (err) {
      console.error(err);
    } else {
      let respMsg = {
        code: 20000,
        message: 'ok',
      };
      res.json(respMsg);
    }
  });
});

// 7天服务费
router.post('/day7fuwufei', function (req, res, next) {
  db.day7_fuwufei(function (err, result) {
    if (err) {
      console.error(err);
    } else {
      let data = {
        fuwufei: result,
      };
      // vue-elementui-admin 约定非20000为错误
      let respMsg = {
        code: 20000,
        message: 'ok',
        data: data
      };
      res.json(respMsg);
    }
  });
});

module.exports = router;
