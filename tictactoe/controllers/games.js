const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('Games Home Page')
})

router.param('id', function(req, res, next, id) {
    // Check if id is valid
    console.log('doing name validations on ' + id);

    // Once validation is done save the new item in the req
    req.id = id;
    // Go to the next thing
    next(); 
});

router.get(':id', (req, res) => {
    res.send('Single Game' + req.id)
})

module.exports = router;
