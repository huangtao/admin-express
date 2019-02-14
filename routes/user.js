var express = require('express');
var router = express.Router();
var tokenHelper = require('../common/tokenHelper');
var db = require('../dao/mssql');
var config = require('../common/config.json');

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
  db.sp_login(userinfo.username, userinfo.password, function (err, result) {
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
        // 登录成功,给token
        let token = tokenHelper.setToken({username:userinfo.username});
        data.token = token;
      } else{
        // 登录失败
        console.log('dbret=' + dbret + ',sql return:' + result.returnValue);
        if (result.returnValue === -3) {
          respMsg.code = 50021;
          respMsg.message = '密码错误!';
        } else {
          respMsg.code = 50020;
          respMsg.message = '登录失败!';
        }
      }
      res.json(respMsg);
    }
  });
});

/* 获取用户信息. */
router.get('/info', function(req, res, next) {
  // 检查token
  let token = req.body.token || req.query.token || req.headers['x-access-token'];
  if (token) {
    tokenHelper.verifyToken(token, function (err, decoded) {
      if (err) {
        // 解码token出错,让客户端重新登录
        return res.json({ code: 50014, message: '请重新登录' });
      } else {
        let respMsg = {
          code: 20000,
          message: 'ok',
          data: {}
        };
        let username = decoded.username;
        let roles = config.general.roles;
        let find = false;
        for (let i = 0; i < roles.length; i++) {
          if (username == roles[i].username) {
            find = true;
            respMsg.data.roles = roles[i].roles;
            respMsg.data.name = username;
            respMsg.data.avatar = roles[i].avatar;
            break;
          }
        }
        if (!find) {
          respMsg.code = 50014;
          respMsg.message = '请重新登录';
        }
        res.json(respMsg);
      }
    });
  } else {
    return res.status(403).send({ code: 50008, message: '非法访问' });
  }
});

// 注销
router.post('/logout', function (req, res, next) {
  let respMsg = {
    code: 20000,
    message: 'ok'
  };
  res.json(respMsg);
});

module.exports = router;
