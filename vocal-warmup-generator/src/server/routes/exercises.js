let express = require('express');
let router = express.Router();

let conn = require('../db/db');
let { requireLogin } = require('../auth/auth');

router.post('/save', requireLogin, function(req, res, next) {
  try {
    let exercise = req.body.params;
    let id = exercise.exerciseId;
    let customName = exercise.customName ? `"${exercise.customName}"` : null;
    // TODO: Validate if WarmupID and PredefinedExerciseID are valid!
    let query;

    if (id === undefined) {

      query = `
        INSERT INTO exercises
          (warmup_id, predefined_exercise_id, name, range_begin, range_end, speed)
        VALUES
          (${exercise.warmupId}, ${exercise.predefinedExerciseId}, ${customName}, ${exercise.range.begin}, ${exercise.range.end}, "${exercise.speed || 'normal'}");
      `;
    } else {
      query = `
        UPDATE exercises
        SET
          predefined_exercise_id = ${exercise.predefinedExerciseId},
          name = ${customName},
          range_begin = ${exercise.range.begin},
          range_end = ${exercise.range.end},
          speed = "${exercise.speed}"
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

router.delete('/delete', requireLogin, function(req, res, next) {
  try {
    let id = req.query.id;
    let query;
    if (id === undefined) {
      res.status(500).send({ message: 'Provide an ID to be deleted.' });
      return;
    } else {
      query = `
        UPDATE exercises e
        JOIN warmups w ON e.warmup_id = w.id
        SET e.deleted_at = now()
        WHERE w.user_id = ${req.session.userId} AND e.id = ${id};
      `;
    }

    console.log(query);

    conn.query(query, (err, results, fields) => {
      if (!err) {
        res.status(200).send({ message: 'Exercise deleted successfully!' });
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
