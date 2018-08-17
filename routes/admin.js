import express from 'express';
import * as db from '../lib/db';
import crypto from 'crypto-js';

var router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
    res.render('admin/index', { title: 'Express' });
});

router.get('/testConnection', async(req, res) => {
    const getStatus = await db.testConnect();
    res.send( getStatus);
});

router.get('/users/:query?', async(req, res, next) => {
    const tbl = 'user';
    const {query} = req.query; // Nama diganti jadi 
    console.log(query);
    if(query != null){
        const rows = await db.query(`SELECT user_id, email, name, level, status FROM ${tbl} WHERE name LIKE '%${query}%' `); 
        res.render('admin/users', { 
            title: 'Express',
            rows: rows // karena ga ke detect klo ditaro diluar makanya biar cepet di taro disini
        });
    }else {
        const rows = await db.query(`SELECT user_id, email, name, level, status FROM ${tbl}`); 
        res.render('admin/users', { 
            title: 'Express',
            rows: rows
        });
    }
});

router.get('/daftarnama/:query?', async(req, res, next) => {
    const tbl = 'daftarnama';
    const {query} = req.query; // Nama diganti jadi 
    console.log(query);
    if(query != null){
        const rows = await db.query(`SELECT Id, Nama, Nama_Keuangan, Nama_Penjadwalan, Nama_BAU, Gelar, NIK, Rekening_Bank, Nama_Rek_DKI FROM ${tbl} WHERE Nama LIKE '%${query}%' `); 
        res.render('admin/daftarnama', { 
            title: 'Express',
            rows: rows // karena ga ke detect klo ditaro diluar makanya biar cepet di taro disini
        });
    }else {
        const rows = await db.query(`SELECT Id, Nama, Nama_Keuangan, Nama_Penjadwalan, Nama_BAU, Gelar, NIK, Rekening_Bank, Nama_Rek_DKI FROM ${tbl}`); 
        res.render('admin/daftarnama', { 
            title: 'Express',
            rows: rows
        });
    }
});

router.get('/users/addUser', (req, res, next) => {
    res.render('admin/addUser', { title: 'Express' });
});

router.get('/users/addNama', (req, res, next) => {//karna /daftarnama dianggep /query
    res.render('admin/addNama', { title: 'Express' });
    console.log("makan");
});

router.get('/detailedUsers/:id', async(req, res, next) => {
    const id = req.params.id;
    const row = await db.query(`SELECT user_id, email, name, status FROM user WHERE user_id=${id}`);
    res.render('admin/detailUser', {
        title: 'Detail User',
        row: row
    });
});

router.get('/detailedNama/:id', async(req, res, next) => { //utk nampilin datanya id itu
    const id = req.params.id;
    const tbl = 'daftarnama';
    const row = await db.query(`SELECT Id, Nama, Nama_Keuangan, Nama_Penjadwalan, Nama_BAU, Gelar, NIK, Rekening_Bank, Nama_Rek_DKI FROM ${tbl} WHERE Id=${id}`);
    console.log(row) ;
    res.render('admin/detailNama', { //yg ini view jd harus sesuai nama, klo yg diatas ga sama gpp krn utk routing
        title: 'Detail Nama',
        alik: row,
        jeni: "makan"
    });
});


router.get('/updatePassword', (req, res, next) => {
    res.render('admin/updatePassword', { title: 'Change Password' });
});

router.get('/deleteUser/:id', async(req, res) => {
    const id = req.params.id;
    const tableName = 'user';
    const result = await db.query(`DELETE FROM ${tableName} WHERE user_id=${id}`);
    console.log(result);
    res.redirect('/users');
});

router.get('/deleteNama/:id', async(req, res) => {
    const id = req.params.id;
    const tableName = 'daftarnama';
    const result = await db.query(`DELETE FROM ${tableName} WHERE Id=${id}`);
    console.log(result);
    res.redirect('/daftarnama');
});

/*
* POST method below
*/
router.post('/createUser', async(req,res) =>{
    const {email, password, password2, name} = req.body;
    const tableName = 'user';
    const hashedPassword = crypto.SHA3(password, {outputLength: 512}).toString();
    const tableValue = {
        name: name, 
        email: email, 
        password: hashedPassword,
        status: 1,
        level: 1
    }
    const result = await db.insertRow(tableName, tableValue, res);
    res.redirect('/users');
});

router.post('/createNama', async(req, res) => {
    const {Nama, Nama_Keuangan, Nama_Penjadwalan, Nama_BAU, Gelar, NIK, Rekening_Bank, Nama_Rek_DKI} = req.body;//input dr browser
    const tableName = 'daftarnama';
    const tableValue = {
        Nama : Nama,
        Nama_Keuangan : Nama_Keuangan,
        Nama_Penjadwalan : Nama_Penjadwalan,
        Nama_BAU : Nama_BAU,
        Gelar : Gelar,
        NIK : NIK,
        Rekening_Bank : Rekening_Bank,
        Nama_Rek_DKI : Nama_Rek_DKI
    }
    const result = await db.insertRow(tableName, tableValue, res);
    res.redirect('/daftarnama');
});

router.post('/editUser/:id', async(req,res) =>{
    const {email, password, password2, name, status} = req.body;
    const id = req.params.id;
    const tableName = 'user';
    const condition = {
        user_id:id
    }
    if(password===password2){
        const hashedPassword = crypto.SHA3(password, {outputLength: 512}).toString();
        if(password!=''){
            const tableValue = {
                name: name, 
                email: email, 
                password: hashedPassword,
                status: status
            }
            const result = await db.updateRow(tableName, tableValue, condition, res);
        }else{
            const tableValue = {
                name: name, 
                email: email,
                status: status
            }
            const result = await db.updateRow(tableName, tableValue, condition, res);            
        }
        res.redirect('/users');
    }else{
        var err = new Error('Password not match');
        err.status = 'Password not match'
        res.send(err.status);
    }
});

router.post('/editNama/:id', async(req, res) => {
    const {Nama, Nama_Keuangan, Nama_Penjadwalan, Nama_BAU, Gelar, NIK, Rekening_Bank, Nama_Rek_DKI} = req.body;
    const id = req.params.id;
    const tableName = 'daftarnama';
    const condition = { //utk kayak where kyk kondisi
        ID:id
    }
    const tableValue = {
        Nama : Nama,
        Nama_Keuangan : Nama_Keuangan,
        Nama_Penjadwalan : Nama_Penjadwalan,
        Nama_BAU : Nama_BAU,
        Gelar : Gelar,
        NIK : NIK,
        Rekening_Bank : Rekening_Bank,
        Nama_Rek_DKI : Nama_Rek_DKI    
    }
    const result = await db.updateRow(tableName, tableValue, condition, res); 
    res.redirect('/daftarnama');
})

//router.use("admin/addNama",addNama);



module.exports = router;
