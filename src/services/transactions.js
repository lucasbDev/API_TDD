const ValidationError = require("../errors/ValidationError");
const transactions = require("../routes/transactions");

module.exports = (app) => {
  const find = (userId, filter = {}) => {
    return app.db('transactions')
      .join('accounts', 'accounts.id', 'acc_id') //join para buscar o ID na tabela de contas
      .where(filter)
      .where('accounts.user_id', '=', userId) //igualando o user ID de account 
      .select();
  };

  const findOne = (filter) => {
    return app.db('transactions')
    .where(filter)
    .first()
  };

  const save = (transactions) => {
    if(!transactions.description) throw new ValidationError('Descrição é um campo obrigatório');

    const newTransaction = { ...transactions};
    if((transactions.type === 'I' && transactions.ammount < 0)
      ||  (transactions.type === "O" && transactions.ammount > 0))
    {
      newTransaction.ammount *= -1;
    }
    return app.db('transactions')
    .insert(newTransaction,'*')
  };

  const update = (id,transactions) => {
    return app.db('transactions')
    .where({id})
    .update(transactions, '*')
  };

  const remove = (id) => {
    return app.db('accounts')
      .where({ id })
      .del()
  };

  

  return { find,findOne, save, update, remove};
}; 