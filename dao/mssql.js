const sql = require('mssql');
const config = require('../common/config.json');
const iconv = require('iconv-lite');
const crypto = require('crypto');

// 调用登录存储过程
exports.sp_login = function (playerid, pwd, callback) {
  console.log('sp_login:' + playerid);
  // TODO: 中文账号不能登录
  let gbk_playerid = iconv.encode(playerid, 'gbk').toString('latin1');
  // 密码和用户名联合做MD5和数据库保存的密码比较
  let md5 = crypto.createHash('md5');
  let str = playerid + pwd;
  let strBuf = iconv.encode(str, 'gbk');
  md5.update(strBuf);
  let cptPwd = md5.digest('hex').toUpperCase();
  console.log(gbk_playerid + ',' + cptPwd);
  new sql.ConnectionPool(config).connect().then(pool => {
    return pool.request()
      .input('customerid', sql.Char, playerid)
      .input('pwd', sql.Char, cptPwd)
      .input('adapter', sql.Char, '9C5C8E893EBA')
      .output('result', sql.Int, 0)
      .execute('ld_mgr_login');
  }).then(result => {
    //console.dir(result);
    callback(null, result);
  }).catch(err => {
    console.log('login', err);
    callback(err, null);
  });
};

// 获得账号信息
exports.sp_getplayerinfo = function (playerid, callback) {
  let gbk_playerid = iconv.encode(playerid, 'gbk').toString('latin1');
  new sql.ConnectionPool(config).connect().then(pool => {
    return pool.request()
      .input('customerid', sql.Char, gbk_playerid)
      .output('nickname', sql.Char)
      .output('sex', sql.Char)
      .output('permission', sql.Int)
      .output('sid', sql.Char)
      .output('email', sql.Char)
      .output('question', sql.Char)
      .output('answer', sql.Char)
      .output('mac', sql.Char)
      .output('realname', sql.Char)
      .output('cash', sql.Int)
      .output('diamond', sql.Int)
      .output('qljz', sql.Int)
      .output('bank', sql.Int)
      .output('ret', sql.Int, 0)
      .execute('cp_mgr_userinfo2');
  }).then(result => {
    // console.dir(result);
    callback(null, result);
  }).catch(err => {
    console.log('getplayerinfo', err);
    callback(err, null);
  });
};

// 充值
exports.sp_dopay = function (playerid, price, callback) {
  let gbk_playerid = iconv.encode(playerid, 'gbk').toString('latin1');
  new sql.ConnectionPool(config).connect().then(pool => {
    return pool.request()
      .input('usetoid', sql.Char, gbk_playerid)
      .input('rmb', sql.Int, price)
      .output('result', sql.Int, 0)
      .output('bank', sql.Int)
      .execute('ld_mgr_uc');
  }).then(result => {
    // console.dir(result);
    callback(null, result);
  }).catch(err => {
    console.log('dopay', err);
    callback(err, null);
  });
};

// 保险箱
exports.sp_mgrbox = function (playerid, action, value, callback) {
  let gbk_playerid = iconv.encode(playerid, 'gbk').toString('latin1');
  new sql.ConnectionPool(config).connect().then(pool => {
    return pool.request()
      .input('customerid', sql.Char, gbk_playerid)
      .input('action', sql.Int, action)
      .input('value', sql.Int, value)
      .output('data', sql.Int)
      .output('result', sql.Int, 0)
      .execute('cp_mgr_bank');
  }).then(result => {
    // console.dir(result);
    callback(null, result);
  }).catch(err => {
    console.log('mgrbox', err);
    callback(err, null);
  });
};

// 携带银子操作,给虚拟道具(bag表)
exports.sp_mgrbag = function (playerid, action, value, callback) {
  let gbk_playerid = iconv.encode(playerid, 'gbk').toString('latin1');
  new sql.ConnectionPool(config).connect().then(pool => {
    return pool.request()
      .input('customerid', sql.Char, gbk_playerid)
      .input('action', sql.Int, action)
      .input('value', sql.Int, value)
      .output('data', sql.Int)
      .output('result', sql.Int, 0)
      .execute('cp_mgr_bag');
  }).then(result => {
    // console.dir(result);
    callback(null, result);
  }).catch(err => {
    console.log(err);
    callback(err, null);
  });
};

// 携带银子操作,给虚拟道具(bag表)
exports.sp_mgrid = function (playerid, action, callback) {
  let gbk_playerid = iconv.encode(playerid, 'gbk').toString('latin1');
  new sql.ConnectionPool(config).connect().then(pool => {
    return pool.request()
      .input('customerid', sql.Char, gbk_playerid)
      .input('action', sql.Int, action)
      .output('result', sql.Int, 0)
      .execute('cp_mgr_id');
  }).then(result => {
    // console.dir(result);
    callback(null, result);
  }).catch(err => {
    console.log(err);
    callback(err, null);
  });
};

// 积分操作,勤劳奖章操作
exports.sp_jfop = function (playerid, flag, value, callback) {
  let gbk_playerid = iconv.encode(playerid, 'gbk').toString('latin1');
  new sql.ConnectionPool(config).connect().then(pool => {
    return pool.request()
      .input('userid', sql.Char, gbk_playerid)
      .input('flag', sql.Int, flag)
      .input('v', sql.Int, value)
      .output('newJF', sql.Int)
      .output('ret', sql.Int)
      .execute('cp_mgr_jfop');
  }).then(result => {
    // console.dir(result);
    callback(null, result);
  }).catch(err => {
    console.log(err);
    callback(err, null);
  });
};
