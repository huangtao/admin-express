var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var db = require('../dao/mssql');
var config = require('../dao/config.json');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// 登录
router.post('/login', function (req, res, next) {
  console.log('request login...');
  if (!req.body) {
    return;
  }
  let userinfo = req.body;
  if (!userinfo.username || !userinfo.password) {
    return;
  }
  if (userinfo.username.length == 0 || userinfo.password.length == 0) {
    return;
  }
  // 密码和用户名联合做MD5和数据库保存的密码比较
  let md5 = crypto.createHash('md5');
  let str = userinfo.username + userinfo.password;
  md5.update(str);
  let cptPwd = md5.digest('hex');
  db.sp_login(userinfo.username, cptPwd, function (err, result) {
    if (err) {
      console.error(err);
    } else {
      let dbret = result.output.result;
      let data = {
        dbret: dbret,
      };
      // vue-elementui-admin 约定非20000为错误
      let respMsg = {
        code: 20000,
        message: 'ok',
        data: data
      };
      if (dbret === 1) {
        // 登录成功,给一个1小时的token
        let token = jwt.sign({username:userinfo.username}, config.general.jwtSecret, {
          expiresIn: 60 * 60 * 1
        });
        data.token = token;
      } else{
        // 登录失败
        if (result.returnValue === -3) {
          respMsg.code = 50021;
          respMsg.message = '密码错误!';
        } else {
          respMsg.code = 50020;
          respMsg.message = '登录失败!';
        }
      }
      res.send(respMsg);
    }
  });
});

module.exports = router;
