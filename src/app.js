require('dotenv').config();

const express = require('express');
const morgan  = require('morgan');
const cors    = require('cors');
const helmet  = require('helmet');
const cuid    = require('cuid');
const { NODE_ENV } = require('./config');

const app = express();

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'dev';

app.use(morgan(morganOption));
app.use(cors());
app.use(helmet());
app.use(express.json());

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});



app.get('/', (req, res) => {
  res.send('A GET Request');
});

app.post('/', (req, res) => {
  res.json(req.body);
});


const users = [
  {
    "id": "cjsgblka00000jhvf6xfy4mtm",
    "username": "sallyStudent",
    "password": "c00d1ng1sc00l",
    "favoriteClub": "Cache Valley Stone Society",
    "newsLetter": "true"
  },
  {
    "id": "cjsgblka10001jhvfhp1mfvph",
    "username": "johnBlocton",
    "password": "veryg00dpassw0rd",
    "favoriteClub": "Salt City Curling Club",
    "newsLetter": "false"
  }
];


app.post('/register', (req, res) => {

  const { username, password, favoriteClub, newsLetter=false } = req.body;

  // validation code here
  if (!username || username.length < 6 || username.length > 20) {
    return res
      .status(400)
      .send('Username must be between 6 and 20 characters');
  }

  if (!password || password.length < 8 || password.length > 36) {
    return res
      .status(400)
      .send('Password must be between 8 and 36 characters');
  }

  if (!password || !password.match(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)) {
    return res
      .status(400)
      .send('Password must be contain at least one digit');
  }

  const clubs = [
    'Cache Valley Stone Society',
    'Ogden Curling Club',
    'Park City Curling Club',
    'Salt City Curling Club',
    'Utah Olympic Oval Curling Club'
  ];

  const lowercase = clubs.map((club) => { return club.toLowerCase(); });

  if (!favoriteClub || !lowercase.includes(favoriteClub.toLowerCase())) {
    return res
      .status(400)
      .send("Favorite Club must be one of 'Cache Valley Stone Society', 'Ogden Curling Club', 'Park City Curling Club', 'Salt City Curling Club' or 'Utah Olympic Oval Curling Club'");
  }

  // add user to fake database
  const id = cuid();
  const newUser = {
    id,
    username,
    password,
    favoriteClub,
    newsLetter
  };

  users.push(newUser);

  res
    .status(201)
    .location(`http://localhost:8000/user/${id}`)
    .json(newUser);
});

app.delete('/user/:userId', (req, res) => {

  const { userId } = req.params;

  const index = users.findIndex(u => u.id === userId);

  // make sure we actually find a user with that id
  if (index === -1) {
    return res
      .status(404)
      .send('User not found');
  }

  console.log(userId);

  users.splice(index, 1);

  res.status(204).end();
});

app.get('/user', (req, res) => {
  res
    .json(users);
});



module.exports = app;
