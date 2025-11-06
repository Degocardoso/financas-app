// src/utils/csvParser.js
import Papa from 'papaparse';

// Parse de arquivo CSV
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

// Mapeia as colunas do CSV para o formato do app
// Ajuste conforme o formato do seu banco
export const mapCSVToTransaction = (csvRow) => {
  // Exemplo de mapeamento (adapte ao seu banco):
  // CSV esperado: Data, Descrição, Valor
  
  try {
    const date = parseDate(csvRow['Data'] || csvRow['data']);
    const description = csvRow['Descrição'] || csvRow['Descricao'] || csvRow['description'] || 'Sem descrição';
    const amount = parseAmount(csvRow['Valor'] || csvRow['valor'] || csvRow['amount']);
    
    return {
      date: date,
      description: description.trim(),
      amount: amount,
      type: amount >= 0 ? 'income' : 'expense',
      category: 'Importado',
      source: 'csv'
    };
  } catch (error) {
    console.error('Erro ao mapear linha do CSV:', error, csvRow);
    return null;
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

// Validação de estrutura do CSV
export const validateCSVStructure = (data) => {
  if (!data || data.length === 0) {
    return { valid: false, error: 'Arquivo CSV vazio' };
  }
  
  const firstRow = data[0];
  const hasDate = firstRow['Data'] || firstRow['data'];
  const hasDescription = firstRow['Descrição'] || firstRow['Descricao'] || firstRow['description'];
  const hasAmount = firstRow['Valor'] || firstRow['valor'] || firstRow['amount'];
  
  if (!hasDate || !hasAmount) {
    return { 
      valid: false, 
      error: 'CSV deve conter colunas: Data e Valor (Descrição é opcional)' 
    };
  }
  
  return { valid: true };
};
