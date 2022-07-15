const app = require('express')();
const consign = require('consign');
const knex = require('knex');
const knexfile = require('../knexfile');
const express = require('express');
const winston = require('winston')
const uuid = require('uuidv4')


app.db = knex(knexfile[process.env.NODE_ENV]);

app.log = winston.createLogger({
  level: 'debug',
  transports: [
    new winston.transports.Console({format: winston.format.json({space: '1'})}),
    new winston.transports.File({filename: 'logs/error.log', level: 'warn', format: winston.format.combine(winston.format.timestamp(),winston.format.json({space: '1'}))
    })

  ]
})

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
  else {
    const id  = uuid();
    app.log.error(id, name, message, stack)
     res.status(500).json({ id, error: 'falha interna'});
  }
   next(err);
});

// app.db.on('query', (query) => {
//   console.log({sql: query.sql, bidings: query.bidings ? query.bidings.join(","):""});
// } )
// .on("query-response", response => console.log(response))
// .on('error', error => console.log(error));



module.exports = app;