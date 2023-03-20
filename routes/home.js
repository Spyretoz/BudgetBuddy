const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {

    res.render('home', { title: "Welcome to Skroutz" });
        
    client.query('Select * from product', (err, result)=>{
        
        if(!err){
            //console.log(client)
            console.log(result.rows[0])
            //res.send(result);
        }
    });
    client.end;
});


module.exports = router;