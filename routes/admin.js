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

router.get('/users', async(req, res, next) => {
    const tbl = 'user';
    const rows = await db.query(`SELECT user_id, email, name, level, status FROM ${tbl}`); 
    res.render('admin/users', { 
        title: 'Express',
        rows: rows
    });
});

router.get('/daftarnama', async(req, res, next) => {
    const tbl = 'daftarnama';
    const rows = await db.query(`SELECT Id, Nama, Nama_Keuangan, Nama_Penjadwalan, Nama_BAU, Gelar, Nik, Rekening_Bank, Nama_Rek_DKI FROM ${tbl}`); 
    res.render('admin/daftarnama', { 
        title: 'Express',
        rows: rows
    });
});

router.get('/users/addUser', (req, res, next) => {
    res.render('admin/addUser', { title: 'Express' });
});

router.get('/daftarnama/addNama', (req, res, next) => {
    res.render('admin/addNama', { title: 'Express' });
});

router.get('/users/:id', async(req, res, next) => {
    const id = req.params.id;
    const row = await db.query(`SELECT user_id, email, name, status FROM user WHERE user_id=${id}`);
    res.render('admin/detailUser', {
        title: 'Detail User',
        row: row
    });
});

router.get('/daftarnama/:id', async(req, res, next) => { //utk nampilin datanya id itu
    const id = req.params.id;
    const row = await db.query(`SELECT Id, Nama, Nama_Keuangan, Nama_Penjadwalan, Nama_BAU, Gelar, NIK, Rekening_Bank, Nama_Rek_DKI FROM daftarnama WHERE Id=${id}`);
    res.render('admin/detailNama', {
        title: 'Detail Nama',
        row: row
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
    res.redirect('/admin/users');
});

router.get('/deleteNama/:id', async(req, res) => {
    const id = req.params.id;
    const tableName = 'daftarnama';
    const result = await db.query(`DELETE FROM ${tableName} WHERE user_id=${id}`);
    console.log(result);
    res.redirect('/admin/daftarnama');
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
    res.redirect('/admin/users');
});

router.post('/createNama', async(req, res) => {
    const {id, nama, nama_keuangan, nama_penjadwalan, nama_bau, gelar, nik, rekening_bank, nama_rek_dki} = req.body;//input dr browser
    const tableName = 'daftarnama';
    const tableValue = {
        ID : id,
        Nama : nama,
        Nama_Keuangan : nama_keuangan,
        Nama_Penjadwalan : nama_penjadwalan,
        Nama_BAU : nama_bau,
        Gelar : gelar,
        NIK : nik,
        Rekening_Bank : rekening_bank,
        Nama_Rek_DKI : nama_rek_dki
    }
    const result = await db.insertRow(tableName, tableValue, res);
    res.sendStatus(200);
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
        res.redirect('/admin/users');
    }else{
        var err = new Error('Password not match');
        err.status = 'Password not match'
        res.send(err.status);
    }
});

router.post('/editNama/:id', async(req, res) => {
    const {id, nama, nama_keuangan, nama_penjadwalan, nama_bau, gelar, nik, rekening_bank, nama_rek_dki} = req.body;
    const no = req.params.no;
    const tableName = 'daftarnama';
    const condition = { //utk kayak where kyk kondisi
        ID:id
    }
    const tableValue = {
        ID : id,
        Nama : nama,
        Nama_Keuangan : nama_keuangan,
        Nama_Penjadwalan : nama_penjadwalan,
        Nama_BAU : nama_bau,
        Gelar : gelar,
        NIK : nik,
        Rekening_Bank : rekening_bank,
        Nama_Rek_DKI : nama_rek_dki    
    }
    const result = await db.updateRow(tableName, tableValue, condition, res); 
    res.sendStatus(200);
})



module.exports = router;
