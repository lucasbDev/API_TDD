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
  // .include('./config/middlewares.js')
  .then('./services')
  .then('./routes')
  .then('./config/routes.js')
  .into(app);


app.get('/', (req, res) => {
  res.status(200).send();
});

// app.db.on('query', (query) => {
//   console.log({sql: query.sql, bidings: query.bidings ? query.bidings.join(","):""});
// } )
// .on("query-response", response => console.log(response))
// .on('error', error => console.log(error));



module.exports = app;