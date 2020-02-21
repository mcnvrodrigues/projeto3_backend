const express = require('express');
const router  = express.Router();

/* GET home page */
router.post('/education', (req, res, next) => {
  const degree = req.body.degree;

  console.log('Grau de instrução >>>', degree);
  
});

module.exports = router;
