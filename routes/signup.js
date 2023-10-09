const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    res.render("login", {
        styles: ['/css/login.css']
    })
})

router.post('/', (req, res) => {
    res.render("login", {
        styles: ['/css/login.css']
    })
})


module.exports = router