let express = require('express');
let router = express.Router();

/* GET warmups listing. */
router.get('/', function(req, res, next) {
  try {
    // db request
    let warmups = [
      {
        id: 1,
        name: 'db Basic warmup (all)',
        filename: null,
        exercises: [
          { exerciseId: 0, name: 'Bocca Chiusa', range: { begin: 10, end: 12 }},
          { exerciseId: 1, name: 'Vroli vroli', range: { begin: 10, end: 12 }},
          { exerciseId: 2, name: 'O - I - A', range: { begin: 10, end: 12 }},
        ],
      },
      {
        id: 2,
        name: 'db Quick warmup (BC)',
        filename: null,
        exercises: [
          { exerciseId: 0, name: 'Bocca Chiusa', range: { begin: 10, end: 12 }},
        ],
      },
      {
        id: 3,
        name: 'Advanced warmup (vroli)',
        filename: null,
        exercises: [
          { exerciseId: 1, name: 'Vroli vroli', range: { begin: 10, end: 12 }},
          { exerciseId: 1, name: 'Vroli vroli', range: { begin: 10, end: 12 }},
        ],
      },
      {
        id: 4,
        name: 'Range extension warmup (oia)',
        filename: null,
        exercises: [
          { exerciseId: 2, name: 'O - I - A', range: { begin: 10, end: 12 }},
          { exerciseId: 2, name: 'O - I - A', range: { begin: 10, end: 12 }},
          { exerciseId: 2, name: 'O - I - A', range: { begin: 10, end: 12 }},
          { exerciseId: 2, name: 'O - I - A', range: { begin: 10, end: 20 }},
        ],
      },
    ];

    res.status(200).send({ warmups });
  } catch (err) {
    console.log('Error fetching warmups list!', err);
    res.status(500).send({ message: 'Error fetching warmups list' });
  }
});


/* GET warmups listing. */
router.get('/warmup', function(req, res, next) {
  console.log('query', req.query);
  try {
    // db request
    let warmups = [
      {
        id: 1,
        name: 'db 2 Basic warmup (all)',
        filename: null,
        exercises: [
          { exerciseId: 0, name: 'Bocca Chiusa', range: { begin: 10, end: 12 }},
          { exerciseId: 1, name: 'Vroli vroli', range: { begin: 10, end: 12 }},
          { exerciseId: 2, name: 'O - I - A', range: { begin: 10, end: 12 }},
        ],
      },
      {
      id: 2,
      name: 'db 2 Quick warmup (all)',
      filename: null,
      exercises: [
        { exerciseId: 0, name: 'Bocca Chiusa', range: { begin: 10, end: 12 }},
      ],
    }
    ];

    let id = req.query.id;
    let warmup = warmups[id];
    if (warmup) {
      res.status(200).send({ warmup });
    } else {
      console.log('Error: warmup not found!');
      res.status(404).send({ message: 'Error warmup not found' });
    }
  } catch (err) {
    console.log('Error fetching warmups list!', err);
    res.status(500).send({ message: 'Error fetching warmups list' });
  }
});

/* Generate a warmup. */
router.post('/generate', function(req, res, next) {
  try {
    let warmup = req.body;

    console.log('Saving warmup', warmup);
  } catch(err) {
    console.log('Error saving warmup!', err);
    res.status(500).send({ message: 'Error saving warmup' });
  }
});

module.exports = router;
