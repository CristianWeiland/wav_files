let express = require('express');
let router = express.Router();

let conn = require('../db/db');
let { requireLogin } = require('../auth/auth');

function getWarmupQuery(userId, id) {
  let query = `SELECT
    W.id as id,
    W.name as name,
    W.filename as filename,
    E.id as exercise_id,
    E.predefined_exercise_id as predefined_exercise_id,
    E.range_begin as range_begin,
    E.range_end as range_end,
    E.name as exercise_name,
    PE.name as exercise_default_name
  FROM
    warmups W
  JOIN
    exercises E ON W.id = E.warmup_id
  JOIN
    predefined_exercises PE ON E.predefined_exercise_id = PE.id
  WHERE E.deleted_at IS NULL AND W.user_id = ${userId}`;

  if (id) {
    query += ` AND W.id = ${id}`;
  }

  return query;
}

function rawRowToWarmup(rowArray) {
  let warmup = {
    id: rowArray[0].id,
    name: rowArray[0].name,
    filename: rowArray[0].filename,
    exercises: [],
  };

  warmup.exercises = rowArray.map(row => {
    return {
      range: { begin: row.range_begin, end: row.range_end },
      name: row.exercise_name,
      exerciseId: row.exercise_id,
      predefinedExerciseId: row.predefined_exercise_id,
      defaultName: row.exercise_default_name,
    };
  });

  return warmup;
}

/* GET warmups listing. */
router.get('/', requireLogin, function(req, res, next) {
  try {
    const query = getWarmupQuery(req.session.userId);

    conn.query(query, (err, results, fields) => {
      if (err) {
        console.log('Error fetching warmups list!', err);
        res.status(500).send({ message: 'Error fetching warmups list' });
      }

      if (results) {
        let groupedWarmups = {};
        results.forEach(row => {
          groupedWarmups[row.id] = groupedWarmups[row.id] || [];
          groupedWarmups[row.id].push(row);
        });

        let result = [];
        Object.keys(groupedWarmups).forEach(key => {
          result.push(rawRowToWarmup(groupedWarmups[key]));
        });

        res.status(200).send({ warmups: result });
      } else {
        console.log('Error: warmup not found!');
        res.status(404).send({ message: 'Error warmup not found' });
      }
    });
  } catch (err) {
    console.log('Error fetching warmups list!', err);
    res.status(500).send({ message: 'Error fetching warmups list' });
  }
});

/* GET warmup. */
router.get('/warmup', requireLogin, function(req, res, next) {
  try {
    let id = req.query.id;

    const query = getWarmupQuery(req.session.userId, id);

    conn.query(query, (err, results, fields) => {
      if (err) {
        console.log('Error fetching warmups list!', err);
        res.status(500).send({ message: 'Error fetching warmups list' });
      }

      if (results && results.length) {
        res.status(200).send({ warmup: rawRowToWarmup(results) });
      } else {
        res.status(404).send({ message: 'Error warmup not found' });
      }
    });
  } catch (err) {
    res.status(500).send({ message: 'Error fetching warmups list' });
  }
});

/* Save warmup. */
router.post('/save', requireLogin, function(req, res, next) {
  try {
    let warmup = req.body.params;

    let id = warmup.id;
    let name = warmup.name ? `"${warmup.name}"` : null;
    // TODO: Validate if WarmupID and PredefinedExerciseID are valid!
    let query;

    if (id === undefined) {
      query = `INSERT INTO warmups (name, user_id) VALUES (${name}, ${req.session.userId});`;
    } else {
      query = `UPDATE warmups SET name = ${name} WHERE id = ${id};`;
    }

    // TODO: Should I save exercises as well? Most likely yes...

    conn.query(query, (err, results, fields) => {
      console.log(results);
      if (!err) {
        res.status(200).send();
      } else {
        console.log(err);
        res.status(500).send({ message: 'Error saving exercise.' });
      }
    });
  } catch(err) {
    console.log('Error saving warmup!', err);
    res.status(500).send({ message: 'Error saving warmup' });
  }
});

module.exports = router;
