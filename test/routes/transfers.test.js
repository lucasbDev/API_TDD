const request = require('supertest');

const app = require('../../src/app');

const MAIN_ROUTE =  '/Safe/transfers';

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEwMDAwIiwibmFtZSI6InVzZXIgIzEiLCJtYWlsIjoidXNlckBtYWlsLmNvbSJ9.5BZ3MVPZ4eoeqjhzCpHTeOwRB8dLOsu3Vc5GsvRUZ2c'

beforeAll(async () => {
  await app.db.seed.run();
})

test( 'Deve lista apenas as trasnferências do usúario', () => {
  return request(app).get(MAIN_ROUTE)
    .set('authorization', `bearer ${TOKEN}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].description).toBe('Transfer #1');
  });
});

test( 'Deve inserir uma transferência com sucesso', () => {
  return request(app).post(MAIN_ROUTE)
    .set('authorization', `bearer ${TOKEN}`)
    .send({ description: 'Regular Transfer', user_id: 10000, acc_ori_id: 10000, acc_dest_id: 10001, ammount: 100, date: new Date()})
    .then(async (res) => {
      expect(res.status).toBe(201);
      expect(res.body.description).toBe('Regular Transfer');

      const transactions = await app.db('transactions').where({ transfer_id: res.body.id});
      expect(transactions).toHaveLength(2)
      expect(transactions[0].description).toBe('Transfer to acc #10001');
      expect(transactions[1].description).toBe('Transfer from acc #10000');
      expect(transactions[0].ammount).toBe('-100.00');
      expect(transactions[1].ammount).toBe('100.00');
      expect(transactions[0].acc_id).toBe(10000);
      expect(transactions[1].acc_id).toBe(10001);
  });
});

describe('Ao salvar uma trasferência válida...', () => {
  let transferId;
  let income;
  let outcome;

  test( 'Deve retornar o status 201 e os dados da transferência', () => {
  return request(app).post(MAIN_ROUTE)
    .set('authorization', `bearer ${TOKEN}`)
    .send({ description: 'Regular Transfer', user_id: 10000, acc_ori_id: 10000, acc_dest_id: 10001, ammount: 100, date: new Date()})
    .then(async (res) => {
      expect(res.status).toBe(201);
      expect(res.body.description).toBe('Regular Transfer');
      transferId = res.body.id;
  });
});

  test('As transações equivalentes devem ter sido geradas', async () => {
    const transactions = await app.db('transactions').where({ transfer_id: transferId  }).orderBy('ammount')
    expect(transactions).toHaveLength(2);
    [outcome, income] = transactions;
  });

  test('A transação de entrada deve ser positiva', () => {
    expect(income.description).toBe('Transfer from acc #10000');
    expect(income.ammount).toBe('100.00');
    expect(income.acc_id).toBe(10001);
    expect(income.type).toBe('I');
  });

  test('A transação de entrada deve ser negativa', () => {
    expect(outcome.description).toBe('Transfer to acc #10001');
    expect(outcome.ammount).toBe('-100.00');
    expect(outcome.acc_id).toBe(10000);
    expect(outcome.type).toBe('O');
  });

  test('Ambas devem referenciar as transferências que a originou', () => {
    expect(income.transfer_id).toBe(transferId)
    expect(outcome.transfer_id).toBe(transferId)
  });

});

describe('Ao tentar salvar uma senha inválida...', () => {
  const validTransfer = { description: 'Regular Transfer', user_id: 10000, acc_ori_id: 10000, acc_dest_id: 10001, ammount: 100, date: new Date()}

  const template = (newData, errorMessage) => {
    request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${MAIN_ROUTE}`)
      .send({ ...validTransfer, ...newData})
      .then((res) => {
        expect(res.status).toBe(400)
        expect(res.body.error).toBe(errorMessage);
    });
  }
    test('Não deve inserir sem descrição', () => template({description: null}, 'Descrição é um campo obrigatório'));

    test('Não deve inserir sem valor', () => template({ammount: null}, 'Valor é um atríbuto obrigatório'));

    test('Não deve inserir sem data', () => template({date: null}, 'Data é um atríbuto obrigatório'));

    test('Não deve inserir sem conta de origem', () => template({acc_ori_id: null}, 'Conta de origem é um atríbuto obrigatório'));

    test('Não deve inserir sem conta de destino', () => template({acc_dest_id: null}, 'Conta de destino é um atríbuto obrigatório'));

    test('Não deve inserir se as contas de origem e de destino forem as mesmas', () => template({acc_dest_id: 1000}, 'Não é possível transferir para a mesma conta'));

    test('Não deve inserir se as contas pertecerem a outro usuário', () => template({acc_ori_id: 1002}, 'Conta #10002 não pertence ao usuário'));
});

test( 'Deve retornar uma transferência por ID', () => {
  request(app).get(`${MAIN_ROUTE}/10000`)
    .set('authorization', `bearer ${TOKEN}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.description).toBe('Transfer #1');
  });
});

// describe('Ao Alterar uma trasferência válida...', () => {
//   let transferId;
//   let income;
//   let outcome;

//   test( 'Deve retornar o status 200 e os dados da transferência', () => {
//   return request(app).put(`${MAIN_ROUTE}/10000`)
//     .set('authorization', `bearer ${TOKEN}`)
//     .send({ description: 'Transfer Update', user_id: 10000, acc_ori_id: 10000, acc_dest_id: 10001, ammount: 500 , date: new Date()})
//     .then(async (res) => {
//       expect(res.status).toBe(200);
//       expect(res.body.description).toBe('Transfer Update');
//       expect(res.body).toBe('500.00');
//       transferId = res.body.id;
//   });
// });

//   test('As transações equivalentes devem ter sido geradas', async () => {
//     const transactions = await app.db('transactions').where({ transfer_id: transferId  }).orderBy('ammount')
//     expect(transactions).toHaveLength(2);
//     [outcome, income] = transactions;
//   });

//   test('A transação de entrada deve ser positiva', () => {
//     expect(income.description).toBe('Transfer from acc #10000');
//     expect(income.ammount).toBe('500.00');
//     expect(income.acc_id).toBe(10001);
//     expect(income.type).toBe('I');
//   });

//   test('A transação de entrada deve ser negativa', () => {
//     expect(outcome.description).toBe('Transfer to acc #10001');
//     expect(outcome.ammount).toBe('-500.00');
//     expect(outcome.acc_id).toBe(10000);
//     expect(outcome.type).toBe('O');
//   });

//   test('Ambas devem referenciar as transferências que a originou', () => {
//     expect(income.transfer_id).toBe(transferId)
//     expect(outcome.transfer_id).toBe(transferId)
//   });
// });

// describe('Ao remover uma transferência', () => {
//   test( 'Deve retornar o satus 204', () => {
//     return request(app).delete(`${MAIN_ROUTE}/10000`)
//       .set(`authorization`, `bearer ${TOKEN}`)
//       .then((res) => {
//         expect(res.status).toBe(204);
//       });
//   });
        
//   test('O registro deve ter sido removido do banco', () => {
//     return app.db('transfers').where({ id: 10000 })
//       .then((result) => {
//         expect(result).toHaveLength(0);
//         });
//   });

//   test('As transações associadas devem ter sido movidas', () => {
//     return app.db('transactions').where({ transfer_id: 10000 })
//       .then((result) => {
//         expect(result).toHaveLength(0)
//       })
//   })
// });


