const sql = require('mssql');
const config = require('./config');

// 调用登录存储过程
exports.sp_login = function (customerid, pwd, callback) {
    console.log('sp_login:' + customerid);
    new sql.ConnectionPool(config).connect().then(pool => {
        return pool.request()
            .input('customerid', sql.Char, customerid)
            .input('pwd', sql.Char, pwd)
            .input('adapter', sql.Char, '9C5C8E893EBA')
            .output('result', sql.Int, 0)
            .execute('ld_mgr_login');
    }).then(result => {
        console.dir(result);
        callback(null, result);
    }).catch(err => {
        console.log('login', err);
        callback(err, null);
    });
};