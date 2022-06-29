const ValidationError = require("../errors/ValidationError");
const bcrypt = require('bcrypt-nodejs')

module.exports = (app) => {
  const findAll = () => {
    return app.db('users').select(['id','name','mail']);
  };

  const findOne = (filter = {}) => {
    return app.db('users').where(filter).first();
  };

  const getPasswHash = (passwd) => {
    const salt = bcrypt.genSaltSync(10)//realiza saltos aleatorios
    return bcrypt.hashSync(passwd, salt);
  }

  const save =  async (user) => {
    // if(!user.name) return { Error: 'nome é um campo obrigatório!'};
    if(!user.name) throw new ValidationError ("nome é um campo obrigatório!")
    if(!user.mail) throw new ValidationError ("email é um campo obrigatório!")
    if(!user.passwd) throw new ValidationError ("senha é um campo obrigatório!");

    const userDb = await findOne({mail: user.mail})
    if (userDb) return {error:'esse email já  está vinculado a uma conta'}
   
    const newUser = { ...user };
    newUser.passwd = getPasswHash(user.passwd); //passou senha crypt
    return app.db('users').insert(newUser, ['id','name','mail']);
  };

  return { findAll, save, findOne }
};