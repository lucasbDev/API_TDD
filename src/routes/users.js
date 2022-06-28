// const app = require("../app");

module.exports = (app) => {
    const findAll = (req, res,next) => {
    app.services.user.findAll()
    .then(result => res.status(200).json(result))
    .catch(err => next(err));
  };
  //retorna status e o array de users

const create = async (req, res, next) => {
    try {
       const result = await app.services.user.save(req.body);// * todas as insertes
       return res.status(201).json(result[0]);
    } catch (err) {
      return next(err);
    }
  };



  // const create = (req,res,next) => {
    
  //      app.services.user.save(req.body)// * todas as insertes
  //      .then(result => res.status(201).json(result[0]))
  //      .catch(err => next(err));
    
  // };
  
  return {findAll, create};
};
// const create = async (req,res,next) => {
//     try {
//        const result = await app.services.user.save(req.body);// * todas as insertes
//        return res.status(201).json(result[0]);
//     } catch (err) {
//       return next(err);
//     }
//   };