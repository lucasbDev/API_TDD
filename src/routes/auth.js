const jwt = require('jwt-simple');
const bcrypt = require('bcrypt-nodejs');
const ValidationError = require("../errors/ValidationError");

const secret = 'segredo!';

  module.exports = (app) => {
    const signin = (req, res, next) => {
      app.services.user.findOne({mail: req.body.mail})
        .then((user) => {
          if (!user)  throw new ValidationError('usúario ou senha incorreta');
          if(bcrypt.compareSync(req.body.passwd, user.passwd)){//bycrpt compara a senha normal e a cripto 
          const payload = {
            id: user.id,
            name: user.name,
            mail: user.mail,
          };
          const token = jwt.encode(payload, secret);
          res.status(200).json({ token });
        }else
          throw new ValidationError('usúario ou senha incorreta')
      }).catch(err => next(err));
  };
  return { signin };
};