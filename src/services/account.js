const ValidationError = require("../errors/ValidationError");
const accounts = require("../routes/accounts");

module.exports = (app) => {
  const save = async (account) => {
    if(!account.name) throw new ValidationError ('é obrigatório o preenchimento do campo nome!')

    const accDb = await find({ name: account.name, user_id: account.user_id}); //tratamento para nome de conta duplicada
    if (accDb) throw new ValidationError('Esse nome já está vinculado a uma conta')

    return app.db('accounts').insert(account, '*')
  };
  const findAll = (userId) => {
    return app.db('accounts').where({user_id: userId})
  };

  const find = (filter = {} ) => {
    return app.db('accounts').where( filter ).first();
  };

  const update = (id,account) => {
    return app.db('accounts')
      .where({id})
      .update(account, '*')
  };

  const remove = async (id) => {
    const transactions = await app.services.transactions.findOne({acc_id:id});
    if(transactions) throw new ValidationError('Essa conta possui transações associadas');

    return app.db('accounts')
      .where({ id })
      .del()
  }

  return {save, findAll, find, update,remove}
};