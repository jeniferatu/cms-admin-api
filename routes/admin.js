import express from 'express';
import * as db from '../lib/db';
import crypto from 'crypto-js';

var router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
    res.render('admin/index', {
        title: 'Selamat Datang'
    });
});

router.get('/testConnection', async (req, res) => {
    const getStatus = await db.testConnect();
    res.send(getStatus);
});

router.get('/users/id/:query?', async (req, res, next) => {
    const tbl = 'admin';
    const {
        query
    } = req.query; // Nama diganti jadi 
    console.log(query);
    if (query != null) {
        const rows = await db.query(`SELECT user_id, email, name, level, status FROM ${tbl} WHERE name LIKE '%${query}%' `);
        res.render('admin/users', {
            title: 'Data Admin',
            rows: rows // karena ga ke detect klo ditaro diluar makanya biar cepet di taro disini
        });
    } else {
        const rows = await db.query(`SELECT user_id, email, name, level, status FROM ${tbl}`);
        res.render('admin/users', {
            title: 'Data Admin',
            rows: rows
        });
    }
});

router.get('/daftarnama/id/:query?', async (req, res, next) => {
    const tbl = 'daftarnama';
    const {
        query
    } = req.query; // Nama diganti jadi 
    console.log(query);
    if (query != null) {
        const rows = await db.query(`SELECT Id, Nama, Nama_Keuangan, Nama_Penjadwalan, Nama_BAU, Gelar, NIK, Id_Rekening, Nama_Keu FROM ${tbl} WHERE Nama LIKE '%${query}%' `);
        res.render('admin/daftarnama', {
            title: 'Data Dosen',
            rows: rows // karena ga ke detect klo ditaro diluar makanya biar cepet di taro disini
        });
    } else {
        const rows = await db.query(`SELECT Id, Nama, Nama_Keuangan, Nama_Penjadwalan, Nama_BAU, Gelar, NIK, Id_Rekening, Nama_Keu FROM ${tbl}`);
        res.render('admin/daftarnama', {
            title: 'Data Dosen',
            rows: rows
        });
    }
});

router.get('/users/addUser', (req, res, next) => {
    res.render('admin/addUser', {
        title: 'Tambah Data Admin'
    });
});

router.get('/daftarnama/addNama', (req, res, next) => { //karna /daftarnama dianggep /query
    res.render('admin/addNama', {
        title: 'Tambah Data Dosen'
    });
    console.log("makan");
});

router.get('/detailedUsers/:id', async (req, res, next) => {
    const id = req.params.id;
    
    const row = await db.query(`SELECT user_id, email, name, status FROM admin WHERE user_id=${id}`);
    res.render('admin/detailUser', {
        title: 'Rincian Data Admin',
        row: row
    });
});

router.get('/detailedNama/:id', async (req, res, next) => { //utk nampilin datanya id itu
    const id = req.params.id;
    const tbl = 'daftarnama';
    const row = await db.query(`SELECT Id, Nama, Nama_Keuangan, Nama_Penjadwalan, Nama_BAU, Gelar, NIK, Id_Rekening, Nama_Keu FROM ${tbl} WHERE Id=${id}`);
    console.log(row);
    res.render('admin/detailNama', { //yg ini view jd harus sesuai nama, klo yg diatas ga sama gpp krn utk routing
        title: 'Rincian Data Dosen',
        alik: row,
        jeni: "makan"
    });
});


router.get('/updatePassword', (req, res, next) => {
    res.render('admin/updatePassword', {
        title: 'Change Password'
    });
});

router.get('/deleteUser/:id', async (req, res) => {
    const id = req.params.id;
    const tableName = 'admin';
    const result = await db.query(`DELETE FROM ${tableName} WHERE user_id=${id}`);
    console.log(result);
    res.redirect('/admin/users/id');
});

router.get('/deleteNama/:id', async (req, res) => {
    const id = req.params.id;
    const tableName = 'daftarnama';
    const result = await db.query(`DELETE FROM ${tableName} WHERE Id=${id}`);
    console.log(result);
    res.redirect('/admin/daftarnama/id');
});

/*
 * POST method below
 */
router.post('/createUser', async (req, res) => {
    const {
        email,
        password,
        password2,
        name
    } = req.body;
    const tableName = 'admin';
    const hashedPassword = crypto.SHA3(password, {
        outputLength: 512
    }).toString();
    const tableValue = {
        name: name,
        email: email,
        password: hashedPassword,
        status: 1,
        level: 1
    }
    const result = await db.insertRow(tableName, tableValue, res);
    res.redirect('/admin/users/id');
});

router.post('/createNama', async (req, res) => {
    const {
        Nama,
        Nama_Keuangan,
        Nama_Penjadwalan,
        Nama_BAU,
        Gelar,
        NIK,
        Id_Rekening, 
        Nama_Keu
    } = req.body; //input dr browser
    const tableName = 'daftarnama';
    const tableValue = {
        Nama: Nama,
        Nama_Keuangan: Nama_Keuangan,
        Nama_Penjadwalan: Nama_Penjadwalan,
        Nama_BAU: Nama_BAU,
        Gelar: Gelar,
        NIK: NIK,
        Id_Rekening : Id_Rekening, 
        Nama_Keu : Nama_Keu
        
    }
    const result = await db.insertRow(tableName, tableValue, res);
    console.log()
    res.redirect('/admin/daftarnama/id');
});

router.post('/editUser/:id', async (req, res) => {
    const {
        email,
        password,
        password2,
        name,
        status
    } = req.body;
    const id = req.params.id;
    const tableName = 'admin';
    const condition = {
        user_id: id
    }
    if (password === password2) {
        const hashedPassword = crypto.SHA3(password, {
            outputLength: 512
        }).toString();
        if (password != '') {
            const tableValue = {
                name: name,
                email: email,
                password: hashedPassword,
                status: status
            }
            const result = await db.updateRow(tableName, tableValue, condition, res);
        } else {
            const tableValue = {
                name: name,
                email: email,
                status: status
            }
            const result = await db.updateRow(tableName, tableValue, condition, res);
        }
        res.redirect('/admin/users/id');
    } else {
        var err = new Error('Password not match');
        err.status = 'Password not match'
        res.send(err.status);
    }
});

router.post('/editNama/:id', async (req, res) => {
    const {
        Nama,
        Nama_Keuangan,
        Nama_Penjadwalan,
        Nama_BAU,
        Gelar,
        NIK,
        Id_Rekening, 
        Nama_Keu
    } = req.body;
    const id = req.params.id;
    const tableName = 'daftarnama';
    const condition = { //utk kayak where kyk kondisi
        ID: id
    }
    const tableValue = {
        Nama: Nama,
        Nama_Keuangan: Nama_Keuangan,
        Nama_Penjadwalan: Nama_Penjadwalan,
        Nama_BAU: Nama_BAU,
        Gelar: Gelar,
        NIK: NIK,
        Id_Rekening : Id_Rekening, 
        Nama_Keu : Nama_Keu
    }
    const result = await db.updateRow(tableName, tableValue, condition, res);
    res.redirect('/admin/daftarnama/id');
})

//router.use("admin/addNama",addNama);

module.exports = router;