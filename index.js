const express = require('express');
const app = express();
const path = require("path");
const http = require('http');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const session = require('express-session');
const multer = require('multer');
const nodemailer = require('nodemailer');
const expressLayouts = require('express-ejs-layouts');
const moment = require('moment');

const hostname = '10.10.193.142';
const port = 10034;
// const hostname = 'localhost';
// const port = 3030;

var crypto = require('crypto');

const server = http.createServer(app).listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}`);
});

var dbConfig = {
  database: 'prj566_183a15',
  host: 'mymysql.senecacollege.ca',
  user: 'prj566_183a15',
  password: 'pdXT9724',
  multipleStatements: true
};

var connection;
function handleDisconnect() {
  connection = mysql.createConnection(dbConfig);
  connection.connect(function onConnect(err) {
    if (err) {
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 10000);
    }
  });

  connection.on('error', function onError(err) {
    console.log('db error', err);
    if (err.code == 'PROTOCOL_CONNECTION_LOST' || err.code == 'ETIMEDOUT') {
      handleDisconnect();
    } else {
      throw err;
    }
  });
}
handleDisconnect();

app.set('views', __dirname + '/Rent-emAll-Web-Portal');
app.set('view engine', 'ejs');
app.use(expressLayouts);

app.use(express.static('Rent-emAll-Web-Portal'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: '@#@$MYSIGN#@$#$',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 24 * 3600 * 1000
  }
}));
app.use(function (req, res, next) {
  res.locals.sess = req.session;
  next();
})


/*************** GET Request **************/

app.get("/", function (req, res) {
  const sess = req.session;
  res.render('main', { name: sess.name, username: sess.username });
});

app.get('/login', function (req, res) {
  const sess = req.session;
  if (!sess.username) {
    res.render('login');
  } else {
    res.render('main', { username: sess.username });
  }
});

app.get('/register', function (req, res) {
  const sess = req.session;
  if (!sess.username) {
    res.render('register');
  } else {
    res.render('main', { username: sess.username });
  }
});

app.get('/forgot', function (req, res) {
  if (!req.session.username) {
    res.render('forgot');
  } else {
    res.render('main', { username: sess.username });
  }
});

app.get('/aboutus', function (req, res) {
  res.render('about-us');
});

app.get('/faq', function (req, res) {
  res.render('faq');
});

app.get('/contactus', function (req, res) {
  res.render('contactus');
});

app.get('/list', function (req, res) {
  const searchKeyword = req.query.searchbar;
  const category = req.query.category;
  const sortby = req.query.sortby;
  var sql = "SELECT * FROM ItemTbl WHERE name LIKE '%" + searchKeyword + "%'";
  var params = [];

  if (!searchKeyword)
    res.redirect('/');
  else {
    if (category == 0) {
      sql += " ORDER BY creationDate DESC";
    } else {
      sql += " AND categoryId = ? ORDER BY creationDate DESC";
      params = [category];
    }

    connection.query(sql + ";SELECT rating FROM ReviewTbl", params, function (err, results) {
      if (err) throw err;

      let mDates = [];
      let fDates = [];
      var averageRate = 0;

      for (var i = 0; i < results[0].length; i++) {
        mDates[i] = moment(results[0][i].creationDate);
        fDates[i] = mDates[i].format('LL');
      }

      for (var i = 0; i < results[1].length; i++)
        averageRate += results[1][i].rating;

      averageRate /= results[1].length;

      res.render('itemlisting', {
        items: results[0],
        postedDates: fDates,
        averageRate: averageRate
      });
    });
  }
});

app.get("/item/:id", function (req, res) {
  var itemId = req.params.id;

  connection.query("SELECT * FROM ItemTbl WHERE itemId = ?; SELECT * FROM ReviewTbl WHERE itemId = ?", [itemId, itemId],
    function (err, results) {
      if (err) throw err;

      var itemPostedDate = moment(results[0][0].creationDate);
      var fItemPostedDate = itemPostedDate.format('LL');

      var reviewPostedDate = [];
      var fReviewPostedDate = [];
      var averageRate = 0;

      for (var i = 0; i < results[1].length; i++) {
        reviewPostedDate[i] = moment(results[1][i].creationDate);
        fReviewPostedDate[i] = reviewPostedDate[i].format('LL');
        averageRate += results[1][i].rating;
      }

      averageRate /= results[1].length;

      function getUser(username, callback) {
        connection.query("SELECT * FROM UserTbl WHERE userId = ?;", [results[0][0].userId],
          function (err, results) {
            if (err)
              callback(err, null);
            else
              callback(null, results[0]);
          });
      }

      getUser(results[0][0].userId, function (err, data) {
        if (err) throw err;

        res.render('item', {
          item: results[0][0],
          itemPostedDate: fItemPostedDate,
          user: data,
          review: results[1],
          reviewPostedDate: fReviewPostedDate,
          averageRate: averageRate
        });
      });
    });
});

app.get('/map', function (req, res) {
  res.render('localmap');
});

app.get('/post', function (req, res) {
  if (req.session.username) {
    res.render('post-item');
  } else {
    res.redirect('/');
  }
});

app.get('/profile', function (req, res) {
  var sess = req.session;
  if (!sess.username) {
    res.render('main');
  } else {
    res.render('user-profile', { sess: sess });
  }
});

app.get('/lenderpage', function (req, res) {
  var sess = req.session;
  if (!sess.username) {
    res.render('main');
  } else {
    connection.query("SELECT * FROM ItemTbl WHERE userId = ?", [sess.userid], function (err, results) {
      if (err) throw err;
      res.render('lenders-page', {
        sess: sess,
        items: results,
        moment: moment
      });
    });
  }
});

// app.get('/lenderpage/:id', function (req, res) {
//   var sess = req.session;
//   res.render('lenders-page', { sess: sess });
// });

app.get('/cart', function (req, res) {
  res.render('cart');
});

app.get('/logout', function (req, res) {
  var sess = req.session;
  if (sess.username) {
    req.session.destroy(function (err) {
      if (err) {
        console.log('Logout Error: ' + err);
      } else {
        res.redirect('/');
      }
    })
  } else {
    res.redirect('/');
  }
});


/*************** POST Request **************/

app.post('/signup', function (req, res) {
  var body = req.body;
  var key = 'myKey';
  var cipher = crypto.createCipher('aes192', key);
  cipher.update(body.password, 'utf8', 'base64');
  var cipheredOutput = cipher.final('base64');

  var province = verifyProvince(body.postalcode);
  if (province) {
    connection.query("INSERT INTO UserTbl (firstName, lastName, userName, password, emailAddress, phoneNumber, province, postalCode) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [
      body.firstname, body.lastname, body.username, cipheredOutput, body.email, body.phoneNum, province, body.postalcode
    ], function (err, result) {
      if (err) {
        res.render('error', { errormessage: 'Unable to register a new user.' });
      } else {
        res.redirect('login');
      }
    });
  } else {
    res.render('error', { errormessage: 'Postal code does not exist.' });
  }
});

app.post('/login', function (req, res) {
  var userid = req.body.username;
  var password = req.body.password;
  var key = 'myKey';
  var sess = req.session;

  connection.query('SELECT * FROM UserTbl WHERE BINARY userName = ?', [userid], function (err, result) {
    if (err) {
      console.log('Error: ' + err);
    } else {
      if (result.length === 0) {
        res.render('error', { errormessage: 'You just entered invalid username.' });
      } else {
        var decipher = crypto.createDecipher('aes192', key);
        decipher.update(result[0].password, 'base64', 'utf8');
        var decipheredOutput = decipher.final('utf8');

        if (password != decipheredOutput) {
          res.render('error', { errormessage: 'You just entered invalid password.' });
        } else {
          sess.userid = result[0].userId;
          sess.username = result[0].userName;
          sess.name = result[0].firstName + ' ' + result[0].lastName;
          sess.firstname = result[0].firstName
          sess.lastname = result[0].lastName;
          sess.postalcode = result[0].postalCode;
          sess.phone = result[0].phoneNumber;
          sess.email = result[0].emailAddress;
          sess.prov = result[0].province;
          res.redirect('/');
        }
      }
    }
  });
});

// Nodemailer Transporter
var transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'rentemallapp@gmail.com',
    pass: 'xfchjinuvfpucgcb'
  }
});

app.post('/forgotuser', function (req, res) {
  var email = req.body.email;

  connection.query('SELECT * FROM UserTbl WHERE emailAddress = ?', [email], function (err, result) {
    if (err) {
      console.log('Error: ' + err);
    } else {
      if (result.length === 0) {
        res.render('error', { errormessage: 'Email address does not exist.' });
      } else {
        var mailOpts = {
          from: 'rentemallapp@gmail.com',
          to: email,
          subject: 'RentemAll Username Request',
          text: `Hi ${result[0].firstName},\n\nYour username is "${result[0].userName}"`
        };
        transporter.sendMail(mailOpts, function (error, response) {
          if (error) {
            res.end("Email send failed");
          } else {
            res.redirect('/');
          }
        });
      }
    }
  });
});

app.post('/forgotpass', function (req, res) {
  var username = req.body.username;
  var email = req.body.email;

  connection.query('SELECT * FROM UserTbl WHERE emailAddress = ? AND BINARY userName = ?', [email, username], function (err, result) {
    if (err) {
      console.log('Error: ' + err);
    } else {
      if (result.length === 0) {
        res.render('error', { errormessage: 'Invalid email and/or username.' });
      } else {
        var newPW = randomPassword();
        console.log('your new password is ' + newPW);

        var key = 'myKey';
        var cipher = crypto.createCipher('aes192', key);
        cipher.update(newPW, 'utf8', 'base64');
        var cipheredOutput = cipher.final('base64');

        connection.query('UPDATE UserTbl SET password = ? WHERE userName = ?', [cipheredOutput, username], function (err, result) {
          if (err) {
            console.log('Error: ' + err);
          } else {
            res.redirect('/');
          }
        });

        var mailOpts = {
          from: 'rentemallapp@gmail.com',
          to: email,
          subject: 'RentemAll Password Reset Request',
          text: `Hi ${result[0].firstName},\n\nYour new password is "${newPW}". After login, Please go to user profile page and change your password.`
        };
        transporter.sendMail(mailOpts, function (error, response) {
          if (error) {
            res.end("Email send failed");
          } else {
            res.redirect('/');
          }
        });
      }
    }
  });
});

app.post('/sendemail', function (req, res) {
  var mailOpts = {
    from: `${req.body.contactName} <${req.body.contaceEmail}>`,
    to: 'rentemallapp@gmail.com',
    subject: 'RentemAll Question Request',
    text: `${req.body.contactName} (${req.body.contaceEmail}) says: ${req.body.message}`
  };
  transporter.sendMail(mailOpts, function (error, response) {
    if (error) {
      res.end("Email send failed");
    } else {
      res.redirect('/');
    }
  });
});

/**************** Post Item ****************/
var upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './Rent-emAll-Web-Portal/uploads/images/');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + "-" + file.originalname);
    }
  })
});
app.post('/postItem', upload.single('photoURL'), function (req, res) {
  var sess = req.session;
  var body = req.body;
  var filePath = '../uploads/images/' + req.file.filename;

  connection.query("INSERT INTO ItemTbl(userId, categoryId, name, description, purchasedYear, rental_price_daily, deposit, postalCode, province, photoURL) VALUES (?,?,?,?,?,?,?,?,?,?)", [
    sess.userid, body.category, body.name, body.description, body.purchasedYear, body.rentPerDay, body.depositPrice, sess.postalcode, sess.prov, filePath
  ], function (err, result) {
    if (err) {
      res.render('error', { errormessage: 'Unable to post your item.' });
    } else {
      console.log(result.insertId);
      res.redirect('/item/' + result.insertId);
    }
  });
});

app.post('/profile', function (req, res) {
  var sess = req.session;
  var body = req.body;

  if (body.password === '') {
    connection.query('UPDATE UserTbl SET postalCode = ?, phoneNumber = ?, emailAddress = ? WHERE BINARY userName = ?', [
      body.postalcode, body.phoneNum, body.email, body.username
    ], function (err, result) {
      if (err) {
        console.log('Error: ' + err);
      } else {
        var province = verifyProvince(body.postalcode);
        if (province) {
          sess.postalcode = body.postalcode;
          sess.phone = body.phoneNum;
          sess.email = body.email;
          sess.prov = province;
          res.redirect('/profile');
        } else {
          res.render('error', { errormessage: 'Postal code does not exist.' });
        }
      }
    });
  } else {
    var key = 'myKey';
    var cipher = crypto.createCipher('aes192', key);
    cipher.update(body.password, 'utf8', 'base64');
    var cipheredOutput = cipher.final('base64');

    connection.query('UPDATE UserTbl SET password = ?, postalCode = ?, phoneNumber = ?, emailAddress = ? WHERE BINARY userName = ?', [
      cipheredOutput, body.postalcode, body.phoneNum, body.email, body.username
    ], function (err, result) {
      if (err) {
        console.log('Error: ' + err);
      } else {
        var province = verifyProvince(body.postalcode);
        if (province) {
          sess.postalcode = body.postalcode;
          sess.phone = body.phoneNum;
          sess.email = body.email;
          sess.prov = province;
          res.redirect('/profile');
        } else {
          res.render('error', { errormessage: 'Postal code does not exist.' });
        }
      }
    });
  }
});

/*************** 404 Not Found **************/

app.all('*', function (req, res) {
  res.status(404).send('<h1>Error 404: Page Not Found</h1>');
});


/*************** Verify province function **************/
function verifyProvince(postalcode) {
  var postalFirstLetter = postalcode.substr(0, 1).toUpperCase();
  var province = '';
  if (postalFirstLetter === 'A') province = 'NL';
  else if (postalFirstLetter === 'B') province = 'NS';
  else if (postalFirstLetter === 'C') province = 'PE';
  else if (postalFirstLetter === 'E') province = 'NB';
  else if (postalFirstLetter === 'G' || postalFirstLetter === 'H' || postalFirstLetter === 'J') province = 'QC';
  else if (postalFirstLetter === 'K' || postalFirstLetter === 'L' || postalFirstLetter === 'M' || postalFirstLetter === 'N' || postalFirstLetter === 'P') province = 'ON';
  else if (postalFirstLetter === 'R') province = 'MB';
  else if (postalFirstLetter === 'S') province = 'SK';
  else if (postalFirstLetter === 'T') province = 'AB';
  else if (postalFirstLetter === 'V') province = 'BC';
  else if (postalFirstLetter === 'X') province = 'NN';
  else if (postalFirstLetter === 'Y') province = 'YT';
  else province = null;

  return province;
}

/*************** Random password generator **************/
function randomPassword() {
  var randomPW = "";
  var possibleUpper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var possibleLower = "abcdefghijklmnopqrstuvwxyz";
  var possibleNum = "0123456789";

  for (var i = 0; i < 4; i++) {
    randomPW += possibleUpper.charAt(Math.floor(Math.random() * possibleUpper.length));
    randomPW += possibleNum.charAt(Math.floor(Math.random() * possibleNum.length));
    randomPW += possibleLower.charAt(Math.floor(Math.random() * possibleLower.length));
  }

  return randomPW;
}