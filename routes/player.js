var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var tokenHelper = require('../common/tokenHelper');
var db = require('../dao/mssql');
var config = require('../common/config.json');
const logger = require('simple-node-logger').createSimpleLogger('admin-express.log');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

// 获取账号信息
router.post('/info', function (req, res, next) {
  console.log('request player info...');
  if (!req.body || (!req.body.playerid && !req.body.numid)) {
    return;
  }
  if (req.body.playerid) {
    if (req.body.playerid.length == 0) {
      return;
    }
    db.sp_getplayerinfo(req.body.playerid, function (err, result) {
      if (err) {
        console.error(err);
      } else {
        let dbret = result.output.ret;
        let data = {
          playerid: req.body.playerid,
          dbret: dbret,
        };
        // vue-elementui-admin 约定非20000为错误
        let respMsg = {
          code: 20000,
          message: 'ok',
          data: data
        };
        if (dbret === 1) {
          data.nickname = result.output.nickname;
          data.sex = result.output.sex;
          data.gold = result.output.cash;
          data.boxGold = result.output.bank;
          data.diamond = result.output.diamond;
          data.qljz = result.output.qljz;
          data.permission = result.output.permission;
          data.email = result.output.email;
          data.question = result.output.question;
          data.answer = result.output.answer;
          data.realname = result.output.realname;
          data.sid = result.output.sid;
          data.machinecode = result.output.mac;
        } else {
          respMsg.message = '查询失败!';
        }
        res.json(respMsg);
      }
    });
  }
});

// 充值
router.post('/dopay', function (req, res, next) {
  console.log('request dopay...');
  if (!req.body || (!req.body.playerid && !req.body.price)) {
    return;
  }
  let playerid = req.body.playerid.trim();
  if (req.body.playerid.length == 0) {
    return;
  }
  let price = parseInt(req.body.price);
  if (isNaN(price)) {
    return;
  }
  if (price == 0) {
    return;
  }
  if (price >= 50) {
    // 检查权限
    if (!tokenHelper.isAdmin(req.token_data.username)) {
      return;
    }
  }
  let str = req.token_data.username + ':dopoay playerid=' + playerid;
  str += ',price=' + price + ',desc=' + req.body.desc;
  logger.info(str);
  db.sp_dopay(playerid, price, req.body.is_yz, function (err, result) {
    if (err) {
      console.error(err);
    } else {
      let dbret = result.output.result;
      let data = {
        playerid: req.body.playerid,
        dbret: dbret,
      };
      // vue-elementui-admin 约定非20000为错误
      let respMsg = {
        code: 20000,
        message: 'ok',
        data: data
      };
      if (dbret === 1) {
        if (req.body.is_yz) {
          data.boxGold = result.output.bank;
        } else {
          data.diamond = result.output.bank;
        }
      } else {
        respMsg.message = '操作失败!';
      }
      res.json(respMsg);
    }
  });
});

// 玩家保险箱操作
router.post('/mgrbox', function (req, res, next) {
  console.log('request manage box...');
  if (!req.body || (!req.body.playerid && !req.body.action)) {
    return;
  }
  let playerid = req.body.playerid.trim();
  if (req.body.playerid.length == 0) {
    return;
  }
  let value = 0;
  if (req.body.action == 1) {
    // 保险箱增减
    // 权限检查
    if (!tokenHelper.isAdmin(req.token_data.username)) {
      return;
    }
    value = parseInt(req.body.value);
    if (isNaN(value)) {
      return;
    }
    if (value == 0) {
      return;
    }
    // 记录到日志
    let str = req.token_data.username + ':mgrbox action=1,playerid=' + playerid;
    str += ',value=' + value + ',desc=' + req.body.desc;
    logger.info(str);
  } else if (req.body.action == 2) {
    // 保险箱清零
  } else if (req.body.action == 3) {
    // 删除保险箱密码
  } else {
    return;
  }
  db.sp_mgrbox(playerid, req.body.action, value, function (err, result) {
    if (err) {
      console.error(err);
    } else {
      let dbret = result.output.result;
      let data = {
        playerid: req.body.playerid,
        dbret: dbret,
      };
      // vue-elementui-admin 约定非20000为错误
      let respMsg = {
        code: 20000,
        message: 'ok',
        data: data
      };
      if (dbret === 1) {
        data.boxGold = result.output.data;
      } else {
        respMsg.message = '操作失败!';
      }
      res.json(respMsg);
    }
  });
});

// 修改玩家登录密码
router.post('/mgrpwd', function (req, res, next) {
  console.log('request manage password...');
  if (!req.body || (!req.body.playerid && !req.body.password)) {
    return;
  }
  let playerid = req.body.playerid.trim();
  if (req.body.playerid.length == 0) {
    return;
  }
  if (req.body.password.length == 0) {
    return;
  }
  db.sp_mgrpwd(playerid, req.body.password, function (err, result) {
    if (err) {
      console.error(err);
    } else {
      // vue-elementui-admin 约定非20000为错误
      let respMsg = {
        code: 20000,
        message: 'ok'
      };
      res.json(respMsg);
    }
  });
});

// 玩家银子清零,给虚拟道具
router.post('/mgrbag', function (req, res, next) {
  console.log('request manage bag...');
  if (!req.body || (!req.body.playerid && !req.body.action)) {
    console.log('param error!');
    return;
  }
  let playerid = req.body.playerid.trim();
  if (req.body.playerid.length == 0) {
    console.log('playerid is zero!');
    return;
  }
  db.sp_mgrbag(playerid, req.body.action, req.body.value, function (err, result) {
    if (err) {
      console.error(err);
    } else {
      let dbret = result.output.result;
      let data = {
        playerid: req.body.playerid,
        dbret: dbret,
        action: req.body.action
      };
      // vue-elementui-admin 约定非20000为错误
      let respMsg = {
        code: 20000,
        message: 'ok',
        data: data
      };
      if (dbret === 1) {
        data.gold = result.output.data;
      } else {
        respMsg.message = '操作失败!';
      }
      res.json(respMsg);
    }
  });
});

// 封号/解封
router.post('/mgrid', function (req, res, next) {
  console.log('request manage id...');
  if (!req.body || (!req.body.playerid && !req.body.action)) {
    console.log('param error!');
    return;
  }
  let playerid = req.body.playerid.trim();
  if (req.body.playerid.length == 0) {
    console.log('playerid is zero!');
    return;
  }
  db.sp_mgrid(playerid, req.body.action, function (err, result) {
    if (err) {
      console.error(err);
    } else {
      let dbret = result.output.result;
      let data = {
        playerid: req.body.playerid,
        dbret: dbret
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

// 积分/勤劳奖章增减
router.post('/jfop', function (req, res, next) {
  console.log('request jfop ...');
  if (!req.body || (!req.body.playerid && !req.body.flag)) {
    console.log('param error!');
    return;
  }
  let playerid = req.body.playerid.trim();
  if (req.body.playerid.length == 0) {
    console.log('playerid is zero!');
    return;
  }
  // 记录到日志
  let str = req.token_data.username + ':jfop flag=' + req.body.flag  + ',playerid=' + playerid;
  str += ',value=' + req.body.value + ',desc=' + req.body.desc;
  logger.info(str);
  db.sp_jfop(playerid, req.body.flag, req.body.value, function (err, result) {
    if (err) {
      console.error(err);
    } else {
      let dbret = result.output.ret;
      let data = {
        playerid: req.body.playerid,
        dbret: dbret
      };
      // vue-elementui-admin 约定非20000为错误
      let respMsg = {
        code: 20000,
        message: 'ok',
        data: data
      };
      if (dbret === 1) {
        data.newjf = result.output.newJF;
      } else {
        respMsg.message = '操作失败!';
      }
      res.json(respMsg);
    }
  });
});

module.exports = router;
