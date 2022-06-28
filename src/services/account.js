const ValidationError = require("../errors/ValidationError");
const accounts = require("../routes/accounts");

module.exports = (app) => {
  const save = async (account) => {
    if(!account.name) throw new ValidationError ('é obrigatório o preenchimento do campo nome!')

    return app.db('accounts').insert(account, '*')
  };
  const findAll = ( ) => {
    return app.db('accounts')
  };

  const find = (filter = {} ) => {
    return app.db('accounts').where( filter ).first();
  };

  const update = (id,account) => {
    return app.db('accounts')
      .where({id})
      .update(account, '*')
  };

  const remove = (id) => {
    return app.db('accounts')
      .where({ id })
      .del()
  }

  return {save, findAll, find, update,remove}
};