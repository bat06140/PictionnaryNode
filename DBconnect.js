/**
 * Created by FG on 14/01/2016.
 */
var mysql = require('mysql');
var logger = require('log4js').getLogger('Server');


var connection = mysql.createConnection({
    host: 'localhost',
    user: 'test',
    password: 'test',
    database: 'pictionnary'
});
connection.connect();


exports.login=function (req,res,data, callback) {
    connection.query('SELECT * from users where email=? and password=?', [data.email , data.password], function (err, rows, fields) {
        if (!err)
        {
            callback(rows);
        }
        else
            logger.error(err);

    });
};