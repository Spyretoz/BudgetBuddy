const express = require('express');
const router = express.Router();
const client = require('../config/database.js')


router.get('/', (req, res) => {

    // Connect to db
    client.connect();

    res.render('home', { title: "Welcome to Skroutz" });
        
    client.query('SELECT * FROM PRODUCT', (err, result)=>{
        
        if(!err) {
            console.log(result.rows)
            // console.log(result.rows[0])
            // res.send(result);
            //const myArr = JSON.parse(result.rows);
        }
    });
    client.end;
});


module.exports = router;