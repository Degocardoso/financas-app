// src/utils/csvParser.js
import Papa from 'papaparse';

// ========================================
// TIPOS DE BANCO SUPORTADOS
// ========================================
export const BANK_TYPES = {
  NUBANK: 'nubank',
  SANTANDER: 'santander',
  INTER: 'inter'
};

// ========================================
// PARSE GENÉRICO DE CSV
// ========================================
export const parseCSV = (csvText) => {
  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

// ========================================
// MAPEADORES POR BANCO
// ========================================

/**
 * Mapeia CSV do Nubank para formato do app
 * Formato: date, title, amount
 * Exemplo: 2025-10-26,Uber Uber *Trip Help.U,14.15
 */
const mapNubankCSV = (csvRow) => {
  try {
    const date = parseDate(csvRow['date']);
    const description = csvRow['title'] || 'Sem descrição';
    const amount = parseAmount(csvRow['amount']);

    return {
      date: date,
      description: description.trim(),
      amount: amount,
      type: amount >= 0 ? 'income' : 'expense',
      category: 'Importado',
      source: 'nubank'
    };
  } catch (error) {
    console.error('Erro ao mapear CSV Nubank:', error, csvRow);
    return null;
  }
};

/**
 * Mapeia CSV do Santander para formato do app
 * Formato: Data, Lançamento, Valor, Saldo
 * ou: Data, Histórico, Valor
 */
const mapSantanderCSV = (csvRow) => {
  try {
    const date = parseDate(
      csvRow['Data'] || csvRow['data'] || csvRow['DATA']
    );
    const description =
      csvRow['Lançamento'] ||
      csvRow['Lancamento'] ||
      csvRow['Histórico'] ||
      csvRow['Historico'] ||
      csvRow['Descrição'] ||
      csvRow['Descricao'] ||
      'Sem descrição';
    const amount = parseAmount(
      csvRow['Valor'] || csvRow['valor'] || csvRow['VALOR']
    );

    return {
      date: date,
      description: description.trim(),
      amount: amount,
      type: amount >= 0 ? 'income' : 'expense',
      category: 'Importado',
      source: 'santander'
    };
  } catch (error) {
    console.error('Erro ao mapear CSV Santander:', error, csvRow);
    return null;
  }
};

/**
 * Mapeia CSV do Banco Inter para formato do app
 * Formato: Data, Descrição, Valor, Saldo
 */
const mapInterCSV = (csvRow) => {
  try {
    const date = parseDate(
      csvRow['Data'] || csvRow['data'] || csvRow['DATA']
    );
    const description =
      csvRow['Descrição'] ||
      csvRow['Descricao'] ||
      csvRow['Histórico'] ||
      csvRow['Historico'] ||
      'Sem descrição';
    const amount = parseAmount(
      csvRow['Valor'] || csvRow['valor'] || csvRow['VALOR']
    );

    return {
      date: date,
      description: description.trim(),
      amount: amount,
      type: amount >= 0 ? 'income' : 'expense',
      category: 'Importado',
      source: 'inter'
    };
  } catch (error) {
    console.error('Erro ao mapear CSV Inter:', error, csvRow);
    return null;
  }
};

/**
 * Mapeia CSV para transação baseado no tipo de banco
 * @param {Object} csvRow - Linha do CSV
 * @param {string} bankType - Tipo do banco (BANK_TYPES)
 */
export const mapCSVToTransaction = (csvRow, bankType = BANK_TYPES.NUBANK) => {
  switch (bankType) {
    case BANK_TYPES.NUBANK:
      return mapNubankCSV(csvRow);
    case BANK_TYPES.SANTANDER:
      return mapSantanderCSV(csvRow);
    case BANK_TYPES.INTER:
      return mapInterCSV(csvRow);
    default:
      return mapNubankCSV(csvRow); // Default para Nubank
  }
};

// Parse de data (aceita vários formatos)
const parseDate = (dateString) => {
  if (!dateString) throw new Error('Data vazia');
  
  // Remove espaços
  dateString = dateString.trim();
  
  // Tenta formato DD/MM/YYYY
  if (dateString.includes('/')) {
    const parts = dateString.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1; // Mês começa em 0
      const year = parseInt(parts[2]);
      return new Date(year, month, day);
    }
  }
  
  // Tenta formato YYYY-MM-DD
  if (dateString.includes('-')) {
    return new Date(dateString);
  }
  
  throw new Error('Formato de data não reconhecido');
};

// Parse de valor monetário
const parseAmount = (amountString) => {
  if (!amountString) return 0;
  
  // Remove espaços e converte para string
  amountString = String(amountString).trim();
  
  // Remove símbolo de moeda (R$, $, etc)
  amountString = amountString.replace(/[R$\s]/g, '');
  
  // Substitui vírgula por ponto
  amountString = amountString.replace(',', '.');
  
  // Remove outros caracteres não numéricos (exceto ponto e sinal negativo)
  amountString = amountString.replace(/[^\d.-]/g, '');
  
  const amount = parseFloat(amountString);
  
  if (isNaN(amount)) {
    throw new Error('Valor inválido');
  }
  
  return amount;
};

// ========================================
// VALIDAÇÃO DE ESTRUTURA DO CSV
// ========================================

/**
 * Valida estrutura do CSV baseado no tipo de banco
 * @param {Array} data - Dados parseados do CSV
 * @param {string} bankType - Tipo do banco (BANK_TYPES)
 */
export const validateCSVStructure = (data, bankType = BANK_TYPES.NUBANK) => {
  if (!data || data.length === 0) {
    return { valid: false, error: 'Arquivo CSV vazio' };
  }

  const firstRow = data[0];

  switch (bankType) {
    case BANK_TYPES.NUBANK:
      // Formato: date, title, amount
      if (!firstRow['date'] || !firstRow['amount']) {
        return {
          valid: false,
          error: 'CSV Nubank deve conter colunas: date, title, amount'
        };
      }
      break;

    case BANK_TYPES.SANTANDER:
      // Formato: Data, Lançamento/Histórico, Valor
      const hasDateSantander = firstRow['Data'] || firstRow['data'] || firstRow['DATA'];
      const hasAmountSantander = firstRow['Valor'] || firstRow['valor'] || firstRow['VALOR'];
      if (!hasDateSantander || !hasAmountSantander) {
        return {
          valid: false,
          error: 'CSV Santander deve conter colunas: Data, Lançamento/Histórico, Valor'
        };
      }
      break;

    case BANK_TYPES.INTER:
      // Formato: Data, Descrição, Valor
      const hasDateInter = firstRow['Data'] || firstRow['data'] || firstRow['DATA'];
      const hasAmountInter = firstRow['Valor'] || firstRow['valor'] || firstRow['VALOR'];
      if (!hasDateInter || !hasAmountInter) {
        return {
          valid: false,
          error: 'CSV Inter deve conter colunas: Data, Descrição, Valor'
        };
      }
      break;

    default:
      return { valid: false, error: 'Tipo de banco inválido' };
  }

  return { valid: true };
};
