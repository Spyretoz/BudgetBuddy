const express = require('express');
const router = express.Router();
const client = require('../config/database.js')



router.get('/', (req, res) => {
    res.render('newproduct', { title: "Insert a new product" });
});


router.post('/', (req, res) =>
{
    // Connect to db
    client.connect();
    
    var sql = "INSERT INTO product VALUES(null, '" + req.body.author + "', '" + req.body.title + "','" + req.body.genre + "'," + req.body.price + ")";

    mysqlConnection.query(sql, (err) => 
    {       
        if(!err)        
        {
            resultJson = JSON.stringify([{'ADD':'SUCCESS'}]);
            console.log(req.body);
        }
        else
        {
            resultJson = JSON.stringify([{'ADD':'FAIL'}]); 
            console.log("ERROR");
        }
        res.end(resultJson);
    });
    
    mysqlConnection.end();
});


module.exports = router;