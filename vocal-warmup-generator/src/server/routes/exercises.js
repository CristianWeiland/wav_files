let express = require('express');
let router = express.Router();

let conn = require('../db/db');

router.post('/save', function(req, res, next) {
  try {
    let exercise = req.body.params;
    let id = exercise.exerciseId;
    // TODO: Validate if WarmupID and PredefinedExerciseID are valid!
    let query;

    if (id === undefined) {
      let customName = exercise.customName ? `"${exercise.customName}"` : null;

      query = `
        INSERT INTO exercises
          (warmup_id, predefined_exercise_id, name, range_begin, range_end)
        VALUES
          (${exercise.warmupId}, ${exercise.predefinedExerciseId}, ${customName}, ${exercise.range.begin}, ${exercise.range.end});
      `;
    } else {
      query = `
        UPDATE exercises
        SET
          predefined_exercise_id = ${exercise.predefinedExerciseId},
          name = "${exercise.customName}",
          range_begin = ${exercise.range.begin},
          range_end = ${exercise.range.end}
        WHERE id = ${id};`;
    }

    conn.query(query, (err, results, fields) => {
      if (!err) {
        res.status(200).send();
      } else {
        console.log(err);
        res.status(500).send({ message: 'Error saving exercise.' });
      }
    });
  } catch (err) {
    console.log('Error saving exercise!', err);
    res.status(500).send({ message: 'Error saving exercise.' });
  }
});

module.exports = router;
