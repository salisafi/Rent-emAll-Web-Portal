const express = require('express');
const app = express();
const path = require("path");
const http = require('http');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const session = require('express-session');
const nodemailer = require('nodemailer');
const expressLayouts = require('express-ejs-layouts');

// const hostname = '10.10.193.142';
// const port = 10034;
const hostname = 'localhost';
const port = 3030;

var crypto = require('crypto');

const server = http.createServer(app).listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}`);
});

var connection = mysql.createConnection({
  database: 'prj566_182a08',
  host: 'zenit.senecac.on.ca',
  path: '/phpMyAdmin/',
  user: 'prj566_182a08',
  password: 'jaMW2249'
});

connection.connect(function (err) {
  if (err) throw err;
  console.log("Database connected successfully.");
});

app.set('views', __dirname + '/Rent-emAll-Web-Portal');
app.set('view engine', 'ejs');
app.use(expressLayouts);

app.use(express.static('Rent-emAll-Web-Portal'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: '@#@$MYSIGN#@$#$',
  resave: false,
  saveUninitialized: true
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
  res.render('itemlisting');
});

app.get('/item', function (req, res) {
  res.render('item');
});

app.get('/map', function (req, res) {
  res.render('localmap');
});

app.get('/post', function (req, res) {
  res.render('post-item');
});

app.get('/profile', function (req, res) {
  if (!req.session.username) {
    res.render('main');
  } else {
    res.render('user-profile', { sess: req.session });
  }
});

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

  connection.query("INSERT INTO UserTbl (firstName, lastName, userName, password, emailAddress, phoneNumber, postalCode) VALUES (?, ?, ?, ?, ?, ?, ?)", [
    body.firstname, body.lastname, body.username, cipheredOutput, body.email, body.phoneNum, body.postalcode
  ], function () {
    res.redirect('login');
  });
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
        res.send('Invalid Username!');
      } else {
        var decipher = crypto.createDecipher('aes192', key);
        decipher.update(result[0].password, 'base64', 'utf8');
        var decipheredOutput = decipher.final('utf8');
        console.log('check password');
        if (password != decipheredOutput) {
          res.send('Invalid Password!');
        } else {
          sess.username = result[0].userName;
          sess.name = result[0].firstName + ' ' + result[0].lastName;
          sess.firstname = result[0].firstName
          sess.lastname = result[0].lastName;
          sess.postalcode = result[0].postalcode;
          sess.phone = result[0].phoneNum;
          sess.email = result[0].email;
          console.log(sess.postalcode);
          console.log(sess);
          res.redirect('/');
        }
      }
    }
  });
});

app.post('/forgotuser', function (req, res) {

});

app.post('/forgotpass', function (req, res) {

});

app.post('/sendemail', function (req, res) {
  var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'rentemallapp@gmail.com',
      pass: 'xfchjinuvfpucgcb'
    }
  });
  var mailOpts = {
    from: req.body.contactName + ' &lt;' + req.body.contaceEmail + '&gt;',
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


/*************** 404 Not Found **************/

app.all('*', function (req, res) {
  res.status(404).send('<h1>Error 404: Page Not Found</h1>');
});


