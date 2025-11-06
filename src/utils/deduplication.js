// src/utils/deduplication.js
import CryptoJS from 'crypto-js';

// Gera um hash único para uma transação
export const generateTransactionHash = (date, description, amount) => {
  // Normaliza a data para string (YYYY-MM-DD)
  let dateString;
  if (date instanceof Date) {
    dateString = date.toISOString().split('T')[0];
  } else {
    dateString = String(date);
  }
  
  // Normaliza a descrição (remove espaços extras e coloca em minúsculo)
  const normalizedDescription = String(description).trim().toLowerCase();
  
  // Normaliza o valor (2 casas decimais)
  const normalizedAmount = parseFloat(amount).toFixed(2);
  
  // Cria a chave única
  const key = `${dateString}_${normalizedDescription}_${normalizedAmount}`;
  
  // Gera o hash SHA-256
  const hash = CryptoJS.SHA256(key).toString();
  
  return hash;
};

// Valida se um hash é válido
export const isValidHash = (hash) => {
  if (!hash) return false;
  // Hash SHA-256 tem 64 caracteres hexadecimais
  return /^[a-f0-9]{64}$/i.test(hash);
};

// Remove transações duplicadas de um array baseado no hash
export const removeDuplicates = (transactions) => {
  const seen = new Set();
  const unique = [];
  
  transactions.forEach(transaction => {
    if (!transaction.importHash) {
      // Se não tem hash, gera um
      transaction.importHash = generateTransactionHash(
        transaction.date,
        transaction.description,
        transaction.amount
      );
    }
    
    if (!seen.has(transaction.importHash)) {
      seen.add(transaction.importHash);
      unique.push(transaction);
    }
  });
  
  return unique;
};
