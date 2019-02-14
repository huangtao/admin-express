var jwt = require('jsonwebtoken');
var config = require('./config.json');

// 设置token
exports.setToken = function (data) {
    // 登录成功,给一个2小时的token
    let token = jwt.sign(data, config.general.jwtSecret, {
        expiresIn: 60 * 60 * 2
    });
    return token;
};

// 验证token
exports.verifyToken = function(token, callback) {
    jwt.verify(token, config.general.jwtSecret, function (err, decoded) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, decoded);
        }
    });
};

exports.refreshToken = function (req, res, next) {
    let token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers['x-token'];
    if (token) {
        // 验证token
        jwt.verify(token, config.general.jwtSecret, function (err, decoded) {
            if (err) {
                // 解码token出错,让客户端重新登录
                return res.json({ code: 50014, message: '请重新登录' });
            } else {
                req.token_data = decoded;
                console.dir(req.token_data);
                next();
            }
        });
    } else {
        // 没有token
        console.dir(req.headers);
        console.dir(req.body);
        return res.status(403).send({ code: 50008, message: '非法访问' });
    }
}

exports.destoryToken = function (req, res, next) {

}

