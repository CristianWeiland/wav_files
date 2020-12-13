let express = require('express');
let router = express.Router();

let wavGenerator = require('../utils/wav-generator');
let { requireLogin } = require('../auth/auth');

/* Generate a warmup. */
router.post('/generate', requireLogin, function(req, res, next) {
  try {
    let warmup = req.body;

    let response = wavGenerator(warmup);

    if (response.error) {
      res.status(400).send({ error: response.error });
    } else {
      res.status(200).send({ filename: response.filename });
    }
  } catch (err) {
    console.log('Error during wav generation!', err);
    res.status(500).send({ message: 'Error generating warmup audio file. Check your parameters and try again.' });
  }
});

module.exports = router;
