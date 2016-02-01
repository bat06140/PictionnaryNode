var express = require('express');
var morgan = require('morgan'); // Charge le middleware de logging
var favicon = require('serve-favicon'); // Charge le middleware de favicon
var logger = require('log4js').getLogger('Server');
var DB = require('./DBconnect');
var bodyParser = require('body-parser');
var validator = require('validator');
var session = require('express-session');
var sha256 =require('sha256');
var dateFormat = require('dateformat');


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
    if(req.session.userid){
        res.redirect('/main');
    }else{
        res.render('login', {usr: req.session.userid, errors: []});
    }
});

app.get('/login', function(req, res){
    if(req.session.userid){
        res.redirect('/main');
    }
    else {
        res.render('login', {usr: req.session.userid, errors: []});
    }
});

app.post('/login', function(req, res) {
    if(req.session.userid){
        res.redirect('/main');
    }else {
        var bodyEmail = req.body.email;
        var bodyPassword = sha256(String(req.body.password));
        var errors = [];

        if (!validator.isEmail(bodyEmail)) {
            errors.push('Email invalide ');
        }
        if (!validator.isAlphanumeric(bodyPassword)) {
            errors.push('Password invalide ');
        }

        if (errors.length != 0) {
            res.render('login', {usr: req.session.userid, errors: errors});
        }
        else {


            var data = {email: bodyEmail, password: bodyPassword};

            //db
            DB.login(req, res, data, function (rows) {
                if (rows.length == 0) {
                    errors.push('Email ou mot de passe incorrect !');
                    res.render('login', {usr: req.session.userid, errors: errors});
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
    if(req.session.userid){
        res.redirect('main');
    }
    else
    {
        res.render('register', {usr: req.session.userid, errors: []});
    }
});

app.post('/register', function(req, res) {
    if(req.session.userid){
        res.redirect('main');
    }else {
        var bodyEmail = req.body.email;
        var bodyPassword = sha256(String(req.body.password));
        var bodyPrenom = req.body.prenom;
        var bodyNom = req.body.nom;
        var bodyTel = req.body.telephone;
        var bodyWebsite = req.body.web;
        var bodySexe = req.body.sexe;
        var bodyBirthdate = dateFormat(req.body.datenaissance, "isoDateTime");
        var bodyVille = req.body.ville;
        var bodyTaille = req.body.taille;
        var bodyCouleur = req.body.couleur.substr(1);
        var bodyProfilepic = req.body.profilepic;

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

            var data = {
                email: bodyEmail,
                password: bodyPassword,
                prenom: bodyPrenom,
                nom: bodyNom,
                tel: bodyTel,
                website: bodyWebsite,
                sexe: bodySexe,
                birthdate: bodyBirthdate,
                ville: bodyVille,
                taille: bodyTaille,
                couleur: bodyCouleur,
                profilepic: bodyProfilepic
            };

            DB.email(req,res,data,function(rows)
            {
                if (rows.length != 0) {
                    errors.push('Email déjà existant !');
                    res.render('register', {errors: errors, usr: req.session.userid});
                }
                else {
                        DB.register(req, res, data, function (rows) {
                        res.redirect('/login');
                    });
                }
            });
        }
    }
});





app.get('/main', function(req, res){

    data={usr: req.session.userid};
    DB.profil(req,res,data,function(result)
    {
        picture = "";
        for(i = 0; i < result[0].profilepic.length; i++)
            picture += String.fromCharCode( result[0].profilepic[i] );

       user={
           prenom: result[0].prenom,
           profilepic: picture
       };

        DB.selectDrawings(req,res,function(rows)
        {
            res.render('main',{user: user, usr: req.session.userid, drawings: rows});

        });
    });


});


app.get('/logout', function(req, res){
    req.session.destroy();
    res.redirect('/login');
});

app.get('/paint', function(req, res){
    res.render('paint',{usr: req.session.userid});
});

app.post('/paint', function(req,res){
    errors = [];
    if(!validator.isAlphanumeric(req.body.picturename))
        errors.push("Nom incorrect");

    if(errors.length != 0)
        res.render('paint', {user: req.session.userid, errors: errors});
    else {
        data = {
            id_user: req.session.userid,
            commands: req.body.drawingCommands,
            paint: req.body.picture,
            name: req.body.picturename
        };
        DB.insertDrawing(req,res,data);
    }
    res.redirect('main');
});