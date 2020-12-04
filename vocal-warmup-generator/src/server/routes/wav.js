let express = require('express');
let router = express.Router();

let wavGenerator = require('../utils/wav-generator');

/* Generate a warmup. */
router.post('/generate', function(req, res, next) {
  try {
    let warmup = req.body;

    let filename = wavGenerator(warmup);

    res.status(200).send({ filename });
  } catch (err) {
    console.log('Error during wav generation!', err);
    res.status(500).send({ message: 'Error generating warmup audio file. Check your parameters and try again.' });
  }
});

module.exports = router;
