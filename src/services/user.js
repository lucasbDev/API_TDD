module.exports = (app) => {
  const findAll = (filter = {}) => {
    return app.db('users').where(filter).select();
  };

  const save =  async (user) => {
    // if(!user.name) return { Error: 'nome é um campo obrigatório!'};
    if(!user.name) return {error:"nome é um campo obrigatório!"};
    if(!user.mail) return {error:"email é um campo obrigatório!"}
    if(!user.passwd) return {error:"senha é um campo obrigatório!"}

    const userDb = await findAll({mail: user.mail})
    if (userDb && userDb.length > 0 ) return {error:'esse email já  está vinculado a uma conta'}
   
    return app.db('users').insert(user, '*');
  };

  return { findAll, save}
};