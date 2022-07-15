const express = require ('express');

module.exports = (app) => {
  const router = express.Router();

  // const validate = (req, res, next) => {
  //   app.services.transfers.validate({ ...req.body, user_id: req.user.id})
  //     .then(() => next())
  //     .catch(err => next(err)); 
  // };

  router.get('/', (req,res,next) => {
    app.services.transfers.find({ user_id: req.user.id })
      .then(result => res.status(200).json(result))
      .catch(err => next(err));
  });

  router.post('/', (req,res,next) => {
    const transfers = { ...req.body, user_id: req.user.id };
    app.services.transfers.save(transfers)
      .then(result => res.status(201).json(result[0]))
      .catch(err => next(err)); 
  });

   router.get('/:id', (req,res,next) => {
    app.services.transfers.findOne({ id: req.params.id })
      .then(result => res.status(200).json(result))
      .catch(err => next(err)); 
  });

  //  router.put('/:id', (req, res, next) => {
  //   app.services.transfers.update(req.params.id, req.body)
  //     .then(result => res.status(200).json(result[0]))
  //     .catch(err => next(err));
  //  });

  return router;
};