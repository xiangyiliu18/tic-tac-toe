const express = require('express');
const router = express.Router();

/** ------------------ Get requests: HTML templates rendered  ------------------ */
router.get('/signUp', (req, res) => {
    res.send('Sign Up')
})

router.get('/verify', (req, res) => {
    res.send('Verify')
})

/** ------------------ Post requests: Creation and Verification  ------------------ */

/**
 * Add new Uesr
 * Username, Password & Email are required
 */
router.post('/addUser', (req, res) => {

})

/**
 * Verify newly created User using Email & Key received
 * Email & Key are required
 */
router.post('/verify', (req, res) => {

})

module.exports = router;
