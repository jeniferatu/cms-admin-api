import express from 'express';
import * as db from '../lib/db';
import crypto from 'crypto-js';
var router = express.Router();

/* GET home page. */
router.get('/', async(req, res, next) => {
  res.redirect('/login');
});

router.get('/logout', async(req, res, next) => {
  req.session = null;
  res.redirect('/');
});

router.get('/login', async(req, res, next) => {
  res.render('admin/login', {title: 'Login Admin'});
});

router.get('/dashboard', function(req,res){
  if(!loggedIn){
    return res.status(401).send();
  }
  return res.status(200).send("Welcome to super secret API");

})

router.post('/login', async(req, res, next) => {
  const {email, password} = req.body;
  const hashedPassword = crypto.SHA3(password, {outputLength: 512}).toString();
  const tableValue = 'user';
  const row = await db.query(`SELECT * FROM ${tableValue} WHERE email='${email}'`);
  if(row.length > 0){
    if(row[0].password === hashedPassword){
      req.session.loggedIn = true;
      req.session.namaSession = row[0].name;
      req.session.idUser = row[0].user_id;
      req.session.lvlUser = row[0].level;
      res.redirect('/admin');
    }else{
      res.send({
        "code": 204,
        "success": "Email and password does not match"
      });
    }
  }else{
    res.send({
      "code": 204,
      "success": "Email and password does not match"
    });
  }
  res.send(row[0]);
});
module.exports = router;
