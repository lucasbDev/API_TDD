const app = require('express')();

const consign = require('consign');

const knex = require('knex');
const knexfile = require('../knexfile');
const express = require('express');

app.db = knex(knexfile.test);

const { cwd } = require('process');
const { query, response } = require('express');


     app.use(express.json());
     app.use(express.urlencoded({ extended: true }));




consign({
    cwd: 'src',
    verboose: false,
  })
  .include('./config/passport.js')
  // .include('./config/middlewares.js')
  .then('./services')
  .then('./routes')
  .then('./config/router.js')
  .into(app);


app.get('/', (req, res) => {
  res.status(200).send();
});

app.use((err, req, res, next) => {
  const { name, message, stack } =  err;
  if (name ==='ValidationError') res.status(400).json({ error: message })
  if (name ==='RecursoBlock') res.status(403).json({ error: message })
  else res.status(500).json({ name, message, stack });
  next(err);
});

// app.db.on('query', (query) => {
//   console.log({sql: query.sql, bidings: query.bidings ? query.bidings.join(","):""});
// } )
// .on("query-response", response => console.log(response))
// .on('error', error => console.log(error));



module.exports = app;