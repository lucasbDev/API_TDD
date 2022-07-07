const express = require('express');
const app = require('../app');

module.exports = (app) => {
  app.use('/auth', app.routes.auth);
  
  const SafeRouter = express.Router();


    SafeRouter.use('/users',app.routes.users);
    SafeRouter.use('/accounts',app.routes.accounts);
    SafeRouter.use('/transactions',app.routes.transactions);

    app.use('/Safe', app.config.passport.authenticate(), SafeRouter)
    /*
    rota segura, autenticação e rota
    */
};