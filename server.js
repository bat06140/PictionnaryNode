var express = require('express');
var morgan = require('morgan'); // Charge le middleware de logging
var favicon = require('serve-favicon'); // Charge le middleware de favicon
var logger = require('log4js').getLogger('Server');
var DB = require('./DBconnect');
var bodyParser = require('body-parser');
var validator = require('validator');
var session = require('express-session');

var app = express();


app.use(morgan('combined')); // Active le middleware de logging

app.use(express.static(__dirname + '/public')); // Indique que le dossier /public contient des fichiers statiques (middleware chargé de base)

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(session({secret: 'eaz3213ad31a6516ac1',
    resave: true,
    saveUninitialized: true}));

logger.info('server start');
app.listen(1234);

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

/* On affiche le formulaire d'enregistrement */

app.get('/', function(req, res){
    if(req.session.authid){
        res.redirect('/main');
    }else{
        res.render('login', {errors: []});
    }
});

app.get('/login', function(req, res){
    res.render('login', {errors: []});
});

app.post('/login', function(req, res) {
    if(req.session.userid){
        res.render('main');
    }else {
        var bodyEmail = req.body.email;
        var bodyPassword = req.body.password;
        var errors = [];

        if (!validator.isEmail(bodyEmail)) {
            errors.push('Email invalide ');
        }
        if (!validator.isAlphanumeric(bodyPassword)) {
            errors.push('Password invalide ');
        }

        if (errors.length != 0) {
            res.render('login', {errors: errors});
        }
        else {


            var data = {email: bodyEmail, password: bodyPassword};

            //db
            DB.login(req, res, data, function (rows) {
                if (rows.length == 0) {
                    errors.push('Email ou mot de passe incorrect !');
                    res.render('login', {errors: errors});
                }
                else {
                    req.session.userid=rows[0].id;
                    res.redirect('/main');
                }
            });
        }
    }
});




app.get('/register', function(req, res){
    res.render('register', {errors: []});
});

app.post('/login', function(req, res) {
    if(req.session.userid){
        res.render('main');
    }else {
        var bodyEmail = req.body.email;
        var bodyPassword = req.body.password;
        var errors = [];

        if (!validator.isEmail(bodyEmail)) {
            errors.push('Email invalide ');
        }
        if (!validator.isAlphanumeric(bodyPassword)) {
            errors.push('Password invalide ');
        }

        if (errors.length != 0) {
            res.render('login', {errors: errors});
        }
        else {


            var data = {email: bodyEmail, password: bodyPassword};

            //db
            DB.login(req, res, data, function (rows) {
                if (rows.length == 0) {
                    errors.push('Email ou mot de passe incorrect !');
                    res.render('login', {errors: errors});
                }
                else {
                    req.session.userid=rows[0].id;
                    res.redirect('/main');
                }
            });
        }
    }
});





app.get('/main', function(req, res){
    DB.profil(req,res,function(rows)
    {
       user={prenom: rows[0].prenom};
       res.render('main',user);
    });
});