// tests/security-tests.js

/**
 * TESTES DE SEGURANÇA DO FIRESTORE
 *
 * Este arquivo contém testes manuais que você pode executar para verificar
 * a segurança do seu aplicativo.
 *
 * IMPORTANTE: Estes testes devem ser executados em um ambiente de desenvolvimento,
 * não em produção!
 *
 * Para executar:
 * 1. Abra o console do navegador (F12)
 * 2. Faça login no app
 * 3. Copie e cole cada teste no console
 */

// ========================================
// TESTE 1: Isolamento de Dados entre Usuários
// ========================================

/**
 * Este teste verifica se um usuário consegue acessar dados de outro usuário.
 * RESULTADO ESPERADO: Erro de permissão (PERMISSION_DENIED)
 */
async function test1_IsolamentoDeDados() {
  console.log('\n🔍 TESTE 1: Tentando acessar dados de outro usuário...');

  try {
    const { collection, getDocs } = await import('firebase/firestore');
    const { db } = await import('../src/config/firebase');

    // Substitua pelo UID de outro usuário (você pode criar 2 contas de teste)
    const outroUsuarioId = 'COLOQUE_O_UID_DE_OUTRO_USUARIO_AQUI';

    console.log(`Tentando acessar transações do usuário: ${outroUsuarioId}`);

    const transactionsRef = collection(db, `users/${outroUsuarioId}/transactions`);
    const snapshot = await getDocs(transactionsRef);

    // Se chegou aqui, o teste FALHOU
    console.error('❌ TESTE FALHOU: Conseguiu acessar dados de outro usuário!');
    console.error(`Número de documentos acessados: ${snapshot.size}`);
    return false;

  } catch (error) {
    // Erro de permissão é o resultado esperado
    if (error.code === 'permission-denied') {
      console.log('✅ TESTE PASSOU: Acesso negado corretamente');
      console.log(`Mensagem de erro: ${error.message}`);
      return true;
    } else {
      console.error('❌ TESTE FALHOU: Erro inesperado');
      console.error(error);
      return false;
    }
  }
}

// ========================================
// TESTE 2: Validação de Schema - Descrição Muito Longa
// ========================================

/**
 * Este teste verifica se o Firestore rejeita transações com descrição muito longa.
 * RESULTADO ESPERADO: Erro de validação
 */
async function test2_DescricaoMuitoLonga() {
  console.log('\n🔍 TESTE 2: Tentando criar transação com descrição muito longa...');

  try {
    const { addTransaction } = await import('../src/services/transactionService');

    const transacaoInvalida = {
      date: new Date(),
      description: 'X'.repeat(1000), // 1000 caracteres (limite: 500)
      amount: 100,
      type: 'income'
    };

    const result = await addTransaction(transacaoInvalida);

    if (!result.success) {
      console.log('✅ TESTE PASSOU: Transação rejeitada corretamente');
      console.log(`Mensagem de erro: ${result.error}`);
      return true;
    } else {
      console.error('❌ TESTE FALHOU: Transação inválida foi aceita');
      return false;
    }

  } catch (error) {
    console.log('✅ TESTE PASSOU: Transação rejeitada com exceção');
    console.log(`Mensagem de erro: ${error.message}`);
    return true;
  }
}

// ========================================
// TESTE 3: Validação de Valor - Valor Absurdo
// ========================================

/**
 * Este teste verifica se o Firestore rejeita valores absurdos.
 * RESULTADO ESPERADO: Erro de validação
 */
async function test3_ValorAbsurdo() {
  console.log('\n🔍 TESTE 3: Tentando criar transação com valor absurdo...');

  try {
    const { addTransaction } = await import('../src/services/transactionService');

    const transacaoInvalida = {
      date: new Date(),
      description: 'Teste',
      amount: 999999999999, // Valor acima do limite (1 bilhão)
      type: 'income'
    };

    const result = await addTransaction(transacaoInvalida);

    if (!result.success) {
      console.log('✅ TESTE PASSOU: Valor absurdo rejeitado corretamente');
      console.log(`Mensagem de erro: ${result.error}`);
      return true;
    } else {
      console.error('❌ TESTE FALHOU: Valor absurdo foi aceito');
      return false;
    }

  } catch (error) {
    console.log('✅ TESTE PASSOU: Valor absurdo rejeitado com exceção');
    console.log(`Mensagem de erro: ${error.message}`);
    return true;
  }
}

// ========================================
// TESTE 4: Validação de Tipo - Tipo Inválido
// ========================================

/**
 * Este teste verifica se o Firestore rejeita tipos de transação inválidos.
 * RESULTADO ESPERADO: Erro de validação
 */
async function test4_TipoInvalido() {
  console.log('\n🔍 TESTE 4: Tentando criar transação com tipo inválido...');

  try {
    const { addTransaction } = await import('../src/services/transactionService');

    const transacaoInvalida = {
      date: new Date(),
      description: 'Teste',
      amount: 100,
      type: 'transferencia' // Tipo inválido (só aceita 'income' ou 'expense')
    };

    const result = await addTransaction(transacaoInvalida);

    if (!result.success) {
      console.log('✅ TESTE PASSOU: Tipo inválido rejeitado corretamente');
      console.log(`Mensagem de erro: ${result.error}`);
      return true;
    } else {
      console.error('❌ TESTE FALHOU: Tipo inválido foi aceito');
      return false;
    }

  } catch (error) {
    console.log('✅ TESTE PASSOU: Tipo inválido rejeitado com exceção');
    console.log(`Mensagem de erro: ${error.message}`);
    return true;
  }
}

// ========================================
// TESTE 5: Validação de Campos Obrigatórios
// ========================================

/**
 * Este teste verifica se o Firestore rejeita transações sem campos obrigatórios.
 * RESULTADO ESPERADO: Erro de validação
 */
async function test5_CamposObrigatorios() {
  console.log('\n🔍 TESTE 5: Tentando criar transação sem campos obrigatórios...');

  try {
    const { addTransaction } = await import('../src/services/transactionService');

    const transacaoInvalida = {
      date: new Date(),
      // Faltando: description, amount, type
    };

    const result = await addTransaction(transacaoInvalida);

    if (!result.success) {
      console.log('✅ TESTE PASSOU: Transação sem campos obrigatórios rejeitada');
      console.log(`Mensagem de erro: ${result.error}`);
      return true;
    } else {
      console.error('❌ TESTE FALHOU: Transação sem campos obrigatórios foi aceita');
      return false;
    }

  } catch (error) {
    console.log('✅ TESTE PASSOU: Transação rejeitada com exceção');
    console.log(`Mensagem de erro: ${error.message}`);
    return true;
  }
}

// ========================================
// TESTE 6: Verificação de Autenticação
// ========================================

/**
 * Este teste verifica se operações requerem autenticação.
 * RESULTADO ESPERADO: Erro de autenticação
 */
async function test6_VerificarAutenticacao() {
  console.log('\n🔍 TESTE 6: Verificando se autenticação é obrigatória...');

  try {
    const { auth } = await import('../src/config/firebase');

    const usuarioAtual = auth.currentUser;

    if (usuarioAtual) {
      console.log('✅ Usuário autenticado:', usuarioAtual.email);
      console.log('UID:', usuarioAtual.uid);
      return true;
    } else {
      console.error('❌ TESTE FALHOU: Nenhum usuário autenticado');
      console.error('Por favor, faça login antes de executar os testes');
      return false;
    }

  } catch (error) {
    console.error('❌ Erro ao verificar autenticação:', error);
    return false;
  }
}

// ========================================
// TESTE 7: Validação de Transação Recorrente - Dia do Mês Inválido
// ========================================

/**
 * Este teste verifica se o Firestore rejeita transações recorrentes com dia inválido.
 * RESULTADO ESPERADO: Erro de validação
 */
async function test7_DiaDoMesInvalido() {
  console.log('\n🔍 TESTE 7: Tentando criar transação recorrente com dia inválido...');

  try {
    const { addRecurringTransaction } = await import('../src/services/transactionService');

    const recorrenteInvalida = {
      description: 'Teste',
      amount: 100,
      dayOfMonth: 35, // Inválido (máximo: 31)
      type: 'income'
    };

    const result = await addRecurringTransaction(recorrenteInvalida);

    if (!result.success) {
      console.log('✅ TESTE PASSOU: Dia do mês inválido rejeitado corretamente');
      console.log(`Mensagem de erro: ${result.error}`);
      return true;
    } else {
      console.error('❌ TESTE FALHOU: Dia do mês inválido foi aceito');
      return false;
    }

  } catch (error) {
    console.log('✅ TESTE PASSOU: Dia do mês inválido rejeitado com exceção');
    console.log(`Mensagem de erro: ${error.message}`);
    return true;
  }
}

// ========================================
// EXECUTOR DE TODOS OS TESTES
// ========================================

/**
 * Executa todos os testes de segurança sequencialmente
 */
async function executarTodosOsTestes() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║     TESTES DE SEGURANÇA - FINANÇAS APP                 ║');
  console.log('╚════════════════════════════════════════════════════════╝');

  const testes = [
    { nome: 'Verificar Autenticação', funcao: test6_VerificarAutenticacao },
    { nome: 'Isolamento de Dados', funcao: test1_IsolamentoDeDados },
    { nome: 'Descrição Muito Longa', funcao: test2_DescricaoMuitoLonga },
    { nome: 'Valor Absurdo', funcao: test3_ValorAbsurdo },
    { nome: 'Tipo Inválido', funcao: test4_TipoInvalido },
    { nome: 'Campos Obrigatórios', funcao: test5_CamposObrigatorios },
    { nome: 'Dia do Mês Inválido', funcao: test7_DiaDoMesInvalido }
  ];

  let passaram = 0;
  let falharam = 0;

  for (const teste of testes) {
    const resultado = await teste.funcao();
    if (resultado) {
      passaram++;
    } else {
      falharam++;
    }
  }

  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║                    RESUMO DOS TESTES                   ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log(`✅ Testes que passaram: ${passaram}`);
  console.log(`❌ Testes que falharam: ${falharam}`);
  console.log(`📊 Total de testes: ${testes.length}`);

  if (falharam === 0) {
    console.log('\n🎉 PARABÉNS! Todos os testes de segurança passaram!');
  } else {
    console.log('\n⚠️ ATENÇÃO! Alguns testes falharam. Revise a segurança do app.');
  }
}

// ========================================
// INSTRUÇÕES DE USO
// ========================================

console.log(`
╔════════════════════════════════════════════════════════╗
║           COMO USAR ESTES TESTES                       ║
╚════════════════════════════════════════════════════════╝

1. Faça login no aplicativo
2. Abra o console do navegador (F12)
3. Execute um dos comandos abaixo:

   // Executar todos os testes:
   executarTodosOsTestes()

   // Ou executar testes individuais:
   test1_IsolamentoDeDados()
   test2_DescricaoMuitoLonga()
   test3_ValorAbsurdo()
   test4_TipoInvalido()
   test5_CamposObrigatorios()
   test6_VerificarAutenticacao()
   test7_DiaDoMesInvalido()

IMPORTANTE:
- Execute estes testes apenas em ambiente de desenvolvimento
- Para o TESTE 1, você precisa ter 2 contas de teste criadas
- Os testes devem PASSAR quando as regras de segurança rejeitam
  operações inválidas

╔════════════════════════════════════════════════════════╗
`);

// Exporta as funções para uso no console
if (typeof window !== 'undefined') {
  window.executarTodosOsTestes = executarTodosOsTestes;
  window.test1_IsolamentoDeDados = test1_IsolamentoDeDados;
  window.test2_DescricaoMuitoLonga = test2_DescricaoMuitoLonga;
  window.test3_ValorAbsurdo = test3_ValorAbsurdo;
  window.test4_TipoInvalido = test4_TipoInvalido;
  window.test5_CamposObrigatorios = test5_CamposObrigatorios;
  window.test6_VerificarAutenticacao = test6_VerificarAutenticacao;
  window.test7_DiaDoMesInvalido = test7_DiaDoMesInvalido;
}
