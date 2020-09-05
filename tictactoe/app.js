const express = require('express');
const app = express();
const port = 3000;
const router = express.Router();

app.get('/', (req, res) => {
    res.send('Hello Word!')
})

/**
 * Renders Log In Page
 */
app.get('/login', (req, res) => {

})

app.post('/login', (req, res) => {

})

app.post('/logout', (req, res) => {

})

app.listen(port, ()=> {
    console.log(`Listening at http://localhost:${port}`);
})