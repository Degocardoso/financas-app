// src/screens/ImportScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { parseCSV, mapCSVToTransaction, validateCSVStructure } from '../utils/csvParser';
import { addTransaction, transactionExists } from '../services/transactionService';
import { generateTransactionHash } from '../utils/deduplication';

export default function ImportScreen({ navigation }) {
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/csv',
        copyToCacheDirectory: true
      });

      if (result.type === 'success' || result.assets?.[0]) {
        // Expo SDK 50+ usa result.assets[0]
        const file = result.assets ? result.assets[0] : result;
        await processCSV(file.uri);
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
      
      // Valida estrutura
      const validation = validateCSVStructure(data);
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
          // Mapeia para o formato do app
          const transaction = mapCSVToTransaction(row);
          
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Importar Extrato</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>📋 Como importar:</Text>
          <Text style={styles.instructionsText}>
            1. Baixe o extrato do seu banco em formato CSV{'\n'}
            2. O arquivo deve conter as colunas: Data, Descrição e Valor{'\n'}
            3. Clique no botão abaixo para selecionar o arquivo{'\n'}
            4. O app irá evitar duplicatas automaticamente
          </Text>
        </View>

        <View style={styles.exampleCard}>
          <Text style={styles.exampleTitle}>Exemplo de CSV válido:</Text>
          <Text style={styles.exampleText}>
            Data,Descrição,Valor{'\n'}
            05/11/2025,Salário,5000.00{'\n'}
            03/11/2025,Supermercado,-250.50{'\n'}
            01/11/2025,Aluguel,-1200.00
          </Text>
        </View>

        {importing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3498db" />
            <Text style={styles.loadingText}>Importando transações...</Text>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.importButton}
            onPress={pickDocument}
          >
            <Text style={styles.importButtonText}>📁 Selecionar Arquivo CSV</Text>
          </TouchableOpacity>
        )}

        {importResult && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Resultado da Importação:</Text>
            <Text style={styles.resultText}>
              Total de linhas: {importResult.total}
            </Text>
            <Text style={[styles.resultText, styles.successText]}>
              ✓ Importadas: {importResult.imported}
            </Text>
            <Text style={[styles.resultText, styles.warningText]}>
              ⊗ Duplicadas: {importResult.duplicates}
            </Text>
            {importResult.errors > 0 && (
              <Text style={[styles.resultText, styles.errorText]}>
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#3498db',
    padding: 20,
    paddingTop: 50,
  },
  backButton: {
    color: 'white',
    fontSize: 16,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    padding: 20,
  },
  instructionsCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50',
  },
  instructionsText: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 22,
  },
  exampleCard: {
    backgroundColor: '#ecf0f1',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  exampleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50',
  },
  exampleText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#34495e',
  },
  importButton: {
    backgroundColor: '#3498db',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  importButtonText: {
    color: 'white',
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
    color: '#7f8c8d',
  },
  resultCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginTop: 20,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50',
  },
  resultText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#2c3e50',
  },
  successText: {
    color: '#27ae60',
  },
  warningText: {
    color: '#f39c12',
  },
  errorText: {
    color: '#e74c3c',
  },
});
