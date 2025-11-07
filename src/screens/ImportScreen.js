// src/screens/ImportScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useTheme } from '../context/ThemeContext';
import { parseCSV, mapCSVToTransaction, validateCSVStructure, BANK_TYPES } from '../utils/csvParser';
import { addTransaction, transactionExists } from '../services/transactionService';
import { generateTransactionHash } from '../utils/deduplication';

export default function ImportScreen({ navigation }) {
  const { theme } = useTheme();
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [selectedBank, setSelectedBank] = useState(BANK_TYPES.NUBANK);

  const pickDocument = async () => {
    try {
      // DocumentPicker usa Storage Access Framework (SAF) no Android
      // Não precisa de permissões explícitas - o sistema gerencia
      // Aceita múltiplos MIME types para melhor compatibilidade
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/comma-separated-values', 'application/csv', 'text/plain', '*/*'],
        copyToCacheDirectory: true,
        multiple: false
      });

      // Expo SDK 50+ retorna canceled: true em vez de type: 'cancel'
      if (result.canceled) {
        return; // Usuário cancelou
      }

      if (result.assets && result.assets[0]) {
        await processCSV(result.assets[0].uri);
      } else if (result.uri) {
        // Fallback para versões antigas do Expo
        await processCSV(result.uri);
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao selecionar arquivo: ' + error.message);
    }
  };

  const processCSV = async (uri) => {
    setImporting(true);
    setImportResult(null);

    try {
      // Lê o conteúdo do arquivo
      const csvText = await FileSystem.readAsStringAsync(uri);
      
      // Parse do CSV
      const data = await parseCSV(csvText);

      // Valida estrutura baseado no banco selecionado
      const validation = validateCSVStructure(data, selectedBank);
      if (!validation.valid) {
        Alert.alert('Erro', validation.error);
        setImporting(false);
        return;
      }

      // Processa cada linha
      let imported = 0;
      let duplicates = 0;
      let errors = 0;

      for (const row of data) {
        try {
          // Mapeia para o formato do app baseado no banco
          const transaction = mapCSVToTransaction(row, selectedBank);
          
          if (!transaction) {
            errors++;
            continue;
          }

          // Gera hash para de-duplicação
          const hash = generateTransactionHash(
            transaction.date,
            transaction.description,
            transaction.amount
          );

          transaction.importHash = hash;

          // Verifica se já existe
          const exists = await transactionExists(hash);
          
          if (exists) {
            duplicates++;
            continue;
          }

          // Salva no Firestore
          const result = await addTransaction(transaction);
          
          if (result.success) {
            imported++;
          } else {
            errors++;
          }
        } catch (error) {
          console.error('Erro ao processar linha:', error);
          errors++;
        }
      }

      setImportResult({
        total: data.length,
        imported,
        duplicates,
        errors
      });

      if (imported > 0) {
        Alert.alert(
          'Importação Concluída',
          `${imported} transações importadas com sucesso!`,
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        Alert.alert('Atenção', 'Nenhuma transação nova foi importada.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao processar CSV: ' + error.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backButton, { color: theme.colors.onPrimary }]}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.onPrimary }]}>Importar Extrato</Text>
      </View>

      <View style={styles.content}>
        {/* Seleção de Banco */}
        <View style={[styles.bankSelectionCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.bankSelectionTitle, { color: theme.colors.text }]}>🏦 Selecione seu banco:</Text>

          {/* Nubank */}
          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => setSelectedBank(BANK_TYPES.NUBANK)}
          >
            <View style={[styles.radioCircle, { borderColor: theme.colors.primary }]}>
              {selectedBank === BANK_TYPES.NUBANK && (
                <View style={[styles.radioCircleSelected, { backgroundColor: theme.colors.primary }]} />
              )}
            </View>
            <Text style={[styles.radioLabel, { color: theme.colors.text }]}>Nubank</Text>
          </TouchableOpacity>

          {/* Santander */}
          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => setSelectedBank(BANK_TYPES.SANTANDER)}
          >
            <View style={[styles.radioCircle, { borderColor: theme.colors.primary }]}>
              {selectedBank === BANK_TYPES.SANTANDER && (
                <View style={[styles.radioCircleSelected, { backgroundColor: theme.colors.primary }]} />
              )}
            </View>
            <Text style={[styles.radioLabel, { color: theme.colors.text }]}>Santander</Text>
          </TouchableOpacity>

          {/* Inter */}
          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => setSelectedBank(BANK_TYPES.INTER)}
          >
            <View style={[styles.radioCircle, { borderColor: theme.colors.primary }]}>
              {selectedBank === BANK_TYPES.INTER && (
                <View style={[styles.radioCircleSelected, { backgroundColor: theme.colors.primary }]} />
              )}
            </View>
            <Text style={[styles.radioLabel, { color: theme.colors.text }]}>Banco Inter</Text>
          </TouchableOpacity>
        </View>

        {/* Instruções por banco */}
        <View style={[styles.instructionsCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.instructionsTitle, { color: theme.colors.text }]}>📋 Como importar:</Text>
          <Text style={[styles.instructionsText, { color: theme.colors.textSecondary }]}>
            1. Baixe o extrato do {selectedBank === BANK_TYPES.NUBANK ? 'Nubank' : selectedBank === BANK_TYPES.SANTANDER ? 'Santander' : 'Banco Inter'} em formato CSV{'\n'}
            2. Selecione seu banco acima{'\n'}
            3. Clique no botão abaixo para selecionar o arquivo{'\n'}
            4. O app irá evitar duplicatas automaticamente
          </Text>
        </View>

        {/* Exemplo de CSV por banco */}
        <View style={[styles.exampleCard, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Text style={[styles.exampleTitle, { color: theme.colors.text }]}>
            Exemplo de CSV {selectedBank === BANK_TYPES.NUBANK ? 'Nubank' : selectedBank === BANK_TYPES.SANTANDER ? 'Santander' : 'Inter'}:
          </Text>
          {selectedBank === BANK_TYPES.NUBANK && (
            <Text style={[styles.exampleText, { color: theme.colors.textSecondary }]}>
              date,title,amount{'\n'}
              2025-10-26,Uber *Trip,14.15{'\n'}
              2025-10-25,PlayStation - 1/2,25.85{'\n'}
              2025-10-24,Metro,46.90
            </Text>
          )}
          {selectedBank === BANK_TYPES.SANTANDER && (
            <Text style={[styles.exampleText, { color: theme.colors.textSecondary }]}>
              Data,Lançamento,Valor{'\n'}
              05/11/2025,Salário,5000.00{'\n'}
              03/11/2025,Supermercado,-250.50{'\n'}
              01/11/2025,Aluguel,-1200.00
            </Text>
          )}
          {selectedBank === BANK_TYPES.INTER && (
            <Text style={[styles.exampleText, { color: theme.colors.textSecondary }]}>
              Data,Descrição,Valor{'\n'}
              05/11/2025,Salário,5000.00{'\n'}
              03/11/2025,Supermercado,-250.50{'\n'}
              01/11/2025,Aluguel,-1200.00
            </Text>
          )}
        </View>

        {importing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Importando transações...</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.importButton, { backgroundColor: theme.colors.primary }]}
            onPress={pickDocument}
          >
            <Text style={[styles.importButtonText, { color: theme.colors.onPrimary }]}>📁 Selecionar Arquivo CSV</Text>
          </TouchableOpacity>
        )}

        {importResult && (
          <View style={[styles.resultCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.resultTitle, { color: theme.colors.text }]}>Resultado da Importação:</Text>
            <Text style={[styles.resultText, { color: theme.colors.text }]}>
              Total de linhas: {importResult.total}
            </Text>
            <Text style={[styles.resultText, { color: theme.colors.success }]}>
              ✓ Importadas: {importResult.imported}
            </Text>
            <Text style={[styles.resultText, { color: theme.colors.warning }]}>
              ⊗ Duplicadas: {importResult.duplicates}
            </Text>
            {importResult.errors > 0 && (
              <Text style={[styles.resultText, { color: theme.colors.error }]}>
                ✗ Erros: {importResult.errors}
              </Text>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 50,
  },
  backButton: {
    fontSize: 16,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  // Estilos para seleção de banco
  bankSelectionCard: {
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  bankSelectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioCircleSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  radioLabel: {
    fontSize: 16,
  },
  // Outros estilos
  instructionsCard: {
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  instructionsText: {
    fontSize: 14,
    lineHeight: 22,
  },
  exampleCard: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  exampleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  exampleText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  importButton: {
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  importButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
  },
  resultCard: {
    padding: 20,
    borderRadius: 10,
    marginTop: 20,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  resultText: {
    fontSize: 16,
    marginBottom: 8,
  },
});
