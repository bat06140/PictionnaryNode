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

exports.profil=function (req,res,data, callback) {
    connection.query('SELECT * from users where id=?',[data.usr], function (err, rows) {
        if (!err)
        {
            callback(rows);
        }
        else
            logger.error(err);

    });
};

exports.email=function (req,res, data, callback) {
    connection.query('SELECT * from users where email=?',[data.email], function (err, rows) {
        if (!err)
        {
            return callback(rows);
        }
        else
            logger.error(err);

    });
};

exports.register=function (req,res,data, callback) {
    logger.info(data);
    connection.query('INSERT INTO users (email, password, nom, prenom, tel, website, sexe, birthdate, ville, taille, couleur, profilepic) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [data.email,
        data.password,
        data.nom,
        data.prenom,
        data.tel,
        data.website,
        data.sexe,
        data.birthdate,
        data.ville,
        data.taille,
        data.couleur,
        data.profilepic],
        function (err, rows, fields) {
            if (!err)
            {
                callback(rows);
            }
            else
                logger.error(err);

        });
};

exports.insertDrawing = function(req, res, data){

        connection.query("INSERT INTO drawings SET ?",data, function(err){
            if (err)
            {
                logger.error(err);
            }
        });
};

exports.selectDrawings = function(req, res, callback){
    connection.query("SELECT id, name FROM drawings WHERE id_user = ?", [req.session.userid], function (err, rows) {
        if (!err)
        {
            return callback(rows);
        }
        else
            logger.error(err);

    });
};