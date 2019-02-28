var express = require('express');
var router = express.Router();
var db = require('../dao/mssql');
var tokenHelper = require('../common/tokenHelper');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

// 获取平台监控信息
router.get('/totalinfo', function (req, res, next) {
  console.log('request dashboard base info...');
  // 权限检查
  if (!tokenHelper.isAdmin(req.token_data.username)) {
    return;
  }
  db.sp_totalinfo(function (err, result) {
    if (err) {
      console.error(err);
    } else {
      let respMsg = {
        code: 20000,
        message: 'ok',
        xiaohao: result.output.xiaohao,
        chongzhi: result.output.chongzhi,
        newuser: result.output.newuser,
        totalyz: result.output.totalyz
      };
      res.json(respMsg);
    }
  });
});

// 7天服务费
router.post('/day7fuwufei', function (req, res, next) {
  // 权限检查
  if (!tokenHelper.isAdmin(req.token_data.username)) {
    return;
  }
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
