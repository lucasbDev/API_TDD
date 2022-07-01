// const app = require("../app");
const express = require('express');
const { route } = require('../app');

module.exports = (app) => {
  const router = express.Router();

    router.get('/',(req, res,next) => {
    app.services.user.findAll()
    .then(result => res.status(200).json(result))
    .catch(err => next(err));
  });
  //retorna status e o array de users

router.post('/' , async (req, res, next) => {
    try {
       const result = await app.services.user.save(req.body);// * todas as insertes
       return res.status(201).json(result[0]);
    } catch (err) {
      return next(err);
    }
  });

  return router
};

  // const create = (req,res,next) => {
    
  //      app.services.user.save(req.body)// * todas as insertes
  //      .then(result => res.status(201).json(result[0]))
  //      .catch(err => next(err));
    
  // };
  

// const create = async (req,res,next) => {
//     try {
//        const result = await app.services.user.save(req.body);// * todas as insertes
//        return res.status(201).json(result[0]);
//     } catch (err) {
//       return next(err);
//     }
//   };