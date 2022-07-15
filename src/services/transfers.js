const validationError = require('../errors/ValidationError');
const transfers = require('../routes/transfers');
module.exports = (app) => {
  const find = (filter = {}) => {
    return app.db('transfers')
      .where(filter)
      .select();
  };

  const findOne = (filter = {}) => {
    return app.db('transfers')
      .where(filter)
      .select(first);
  };

  const save = async (transfer) => {
    if(!transfer.description) throw new validationError('Descrição é um campo obrigatório');
    if(!transfer.ammount) throw new validationError('Valor é um atríbuto obrigatório');
    if(!transfer.date) throw new validationError('Data é um atríbuto obrigatório');
    if(!transfer.acc_ori_id) throw new validationError('Conta de origem é um atríbuto obrigatório');
    if(!transfer.acc_dest_id) throw new validationError('Conta de destino é um atríbuto obrigatório');
    if(!transfer.acc_dest_id === transfer.acc_ori_id) throw new validationError('Não é possível transferir para a mesma conta');

    const accounts = await app.db('accounts').whereIn('id', [transfer.acc_dest_id, transfer.acc_ori_id]);
    accounts.forEach(acc => {
      if (acc.user_id != parseInt(transfer.user_id, 10)) throw new validationError(`Conta ${acc.id} não pertence ao usuário`)      
    });  

    const result = await app.db('transfers').insert(transfer, '*');
    const transferId = result[0].id;

    const transactions = [
      { description: `Transfer to acc #${transfer.acc_dest_id}`, date: transfer.date, ammount:transfer.ammount * -1, type: 'O', acc_id: transfer.acc_ori_id,transfer_id:transferId},
      { description: `Transfer from acc #${transfer.acc_ori_id}`, date: transfer.date, ammount:transfer.ammount * 1, type: 'I', acc_id: transfer.acc_dest_id,transfer_id:transferId},
    ];

    await app.db('transactions').insert(transactions);
    return result;
  };

  // const update = async (id, transfer) => {
  //   const result = await app.db('transfers')
  //     .where({ id })
  //     .update(transfer, '*');

  //   const transactions = [
  //     { description: `Transfer to acc #${transfer.acc_dest_id}`, date: transfer.date, ammount:transfer.ammount * -1, type: 'O', acc_id: transfer.acc_ori_id,transfer_id:id},
  //     { description: `Transfer from acc #${transfer.acc_ori_id}`, date: transfer.date, ammount:transfer.ammount * 1, type: 'I', acc_id: transfer.acc_dest_id,transfer_id:id},
  //   ];  


  //   await app.db('transactions').where({ transfer_id: id}).del();
  //   await app.db('transactions').insert(transactions);
  //   return result;
  // };
  
  return { find, findOne, save};
};