let express = require('express');
let router = express.Router();
let bcrypt = require('bcrypt');

let conn = require('../db/db');

const saltRounds = 14;

/* GET users listing. */
router.get('/login', function(req, res, next) {
  if (req.session && req.session.userId) {
    console.log('req session userId ', req.session.userId);
    res.status(400).send({ message: 'Already logged in.' });
    return;
  }

  try {
    let email = req.query.email;

    let query = `SELECT id, email, password FROM users WHERE email = "${email}" AND deleted_at IS NULL;`

    conn.query(query, (err, results, fields) => {

      const invalidEmailOrPassword = 'Email ou senha inválidos';

      if (results) {
        let plainTextPassword = req.query.password;
        let hashedPasswordFromDb = results[0].password;

        bcrypt.compare(plainTextPassword, hashedPasswordFromDb, function(err, result) {
          if (result) {
            req.session.userId = results[0].id;
            console.log(req.session);
            console.log(req.sessionID);
            //req.mySession.userId = results[0].id;
            //console.log('sId', req.mySession.userId);
            //res.setHeader('Access-Control-Expose-Headers', 'Set-Cookie');
            res.setHeader("Access-Control-Expose-Headers", "*");
            res.setHeader("Access-Control-Allow-Headers", "*");

            //res.setHeader("Access-Control-Allow-Headers", "Authorization, X-PINGOTHER, Origin, X-Requested-With, Content-Type, Accept, Set-Cookie");

            res.status(200).send({ message: 'Logged in' });
          } else {
            res.status(401).send({ message: invalidEmailOrPassword });
          }
        });
      } else {
        res.status(401).send({ message: invalidEmailOrPassword });
      }
    });
  } catch (e) {
    console.log(e);
  }
});


router.post('/login', function(req, res, next) {
  try {
    let email = req.body.user.email;
    let plainTextPassword = req.body.user.password;

    let query = `SELECT id, email, password FROM users WHERE email = "${email}" AND deleted_at IS NULL;`

    conn.query(query, (err, results, fields) => {

      const invalidEmailOrPassword = 'Invalid email or password';

      if (results) {
        let hashedPasswordFromDb = results[0].password;

        bcrypt.compare(plainTextPassword, hashedPasswordFromDb, function(err, result) {
          if (result) {
            req.session.id = results[0].id;
            console.log(req.session);
            console.log(req.sessionID);
            //req.mySession.userId = results[0].id;
            //console.log('sId', req.mySession.userId);
            //res.setHeader('Access-Control-Expose-Headers', 'Set-Cookie');
            res.setHeader("Access-Control-Expose-Headers", "*");
            res.setHeader("Access-Control-Allow-Headers", "*");
            res.setHeader("x-test", "alala");

            //res.setHeader("Access-Control-Allow-Headers", "Authorization, X-PINGOTHER, Origin, X-Requested-With, Content-Type, Accept, Set-Cookie");

            res.status(200).send({ message: 'Logged in' });
          } else {
            res.status(401).send({ message: invalidEmailOrPassword });
          }
        });
      } else {
        res.status(401).send({ message: invalidEmailOrPassword });
      }
    });
  } catch (e) {
    console.log(e);
  }
});

router.post('/register', function(req, res, next) {
  console.log('register');
  try {
    let user = req.body.user;
    bcrypt.hash(user.password, saltRounds, (err, hashedPassword) => {
      user.password = hashedPassword;

      let query = `
        INSERT INTO users
          (firstName, lastName, email, password, created_at)
        VALUES
          ("${user.firstName}", "${user.lastName}", "${user.email}", "${user.password}", now());
      `;

      conn.query(query, (err, results, fields) => {
        if (!err) {
          res.status(200).send({ message: 'User registered successfully!' });
        } else if (err.code === 'ER_DUP_ENTRY') {
          res.status(400).send({ message: 'Email already registered!' });
        } else {
          console.log(err);
          res.status(500).send({ message: 'Internal server error. Try again later!' });
        }
      });
    });
  } catch(e) {
    console.log(e);
  }
});

module.exports = router;
