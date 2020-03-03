var express = require('express');
var router = express.Router();

/* GET profiles listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a PROFILES routes');
});

module.exports = router;