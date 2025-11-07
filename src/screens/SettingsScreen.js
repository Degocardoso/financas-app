// src/screens/SettingsScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { THEME_MODES } from '../config/themes';
import { logout, reauthenticateUser } from '../services/authService';
import { deleteAllUserData } from '../services/dataService';

const SettingsScreen = ({ navigation }) => {
  const { theme, themeMode, isDark, setThemeMode } = useTheme();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [password, setPassword] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAllData = () => {
    Alert.alert(
      '⚠️ ATENÇÃO',
      'Você está prestes a DELETAR TODOS OS DADOS do aplicativo.\n\n' +
      'Isso inclui:\n' +
      '• Todas as transações importadas\n' +
      '• Todas as receitas cadastradas\n' +
      '• Todas as despesas diárias\n' +
      '• Todos os lançamentos futuros\n\n' +
      'Esta ação é IRREVERSÍVEL!\n\n' +
      'Digite sua senha para confirmar:',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Continuar',
          style: 'destructive',
          onPress: () => setShowDeleteModal(true)
        }
      ]
    );
  };

  const confirmDeleteAllData = async () => {
    if (!password || password.trim() === '') {
      Alert.alert('Erro', 'Por favor, digite sua senha');
      return;
    }

    setDeleting(true);

    try {
      // 1. Reautenticar usuário com senha
      const authResult = await reauthenticateUser(password);

      if (!authResult.success) {
        Alert.alert('Erro', 'Senha incorreta. Tente novamente.');
        setDeleting(false);
        return;
      }

      // 2. Deletar todos os dados
      const deleteResult = await deleteAllUserData();

      if (deleteResult.success) {
        setShowDeleteModal(false);
        setPassword('');
        Alert.alert(
          'Sucesso',
          'Todos os dados foram removidos com sucesso!',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Home')
            }
          ]
        );
      } else {
        Alert.alert('Erro', deleteResult.error || 'Erro ao deletar dados');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao processar: ' + error.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            const result = await logout();
            if (result.success) {
              // Navegação é feita automaticamente pelo App.js ao detectar auth state
            } else {
              Alert.alert('Erro', result.error);
            }
          },
        },
      ]
    );
  };

  const ThemeOption = ({ mode, label, description }) => {
    const isSelected = themeMode === mode;

    return (
      <TouchableOpacity
        style={[
          styles.themeOption,
          {
            backgroundColor: theme.colors.surface,
            borderColor: isSelected ? theme.colors.primary : theme.colors.border,
            borderWidth: isSelected ? 2 : 1,
          },
        ]}
        onPress={() => setThemeMode(mode)}
      >
        <View style={styles.themeOptionContent}>
          <View style={styles.themeOptionHeader}>
            <Text style={[styles.themeOptionLabel, { color: theme.colors.text }]}>
              {label}
            </Text>
            {isSelected && (
              <View
                style={[
                  styles.selectedBadge,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                <Text style={[styles.selectedBadgeText, { color: theme.colors.onPrimary }]}>
                  ✓
                </Text>
              </View>
            )}
          </View>
          <Text style={[styles.themeOptionDescription, { color: theme.colors.textSecondary }]}>
            {description}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Configurações</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Personalize seu aplicativo
        </Text>
      </View>

      {/* Seção: Aparência */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Aparência
        </Text>

        <ThemeOption
          mode={THEME_MODES.LIGHT}
          label="Modo Claro"
          description="Interface clara para melhor visualização durante o dia"
        />

        <ThemeOption
          mode={THEME_MODES.DARK}
          label="Modo Noturno"
          description="Interface escura que reduz o cansaço visual à noite"
        />

        <ThemeOption
          mode={THEME_MODES.SYSTEM}
          label="Padrão do Sistema"
          description="Segue automaticamente as configurações do seu dispositivo"
        />
      </View>

      {/* Informações do Tema Atual */}
      <View style={[styles.infoBox, { backgroundColor: theme.colors.surfaceVariant }]}>
        <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
          Tema atual:{' '}
          <Text style={[styles.infoTextBold, { color: theme.colors.text }]}>
            {isDark ? 'Escuro' : 'Claro'}
          </Text>
        </Text>
        <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
          Modo selecionado:{' '}
          <Text style={[styles.infoTextBold, { color: theme.colors.text }]}>
            {themeMode === THEME_MODES.LIGHT && 'Claro'}
            {themeMode === THEME_MODES.DARK && 'Escuro'}
            {themeMode === THEME_MODES.SYSTEM && 'Sistema'}
          </Text>
        </Text>
      </View>

      {/* Seção: Dados */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Dados
        </Text>

        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: theme.colors.error,
              borderWidth: 2,
              borderColor: theme.colors.errorDark,
            },
          ]}
          onPress={handleDeleteAllData}
        >
          <Text style={[styles.buttonText, { color: theme.colors.onError }]}>
            🗑️ Limpar Todos os Dados
          </Text>
          <Text style={[styles.buttonSubtext, { color: theme.colors.onError }]}>
            Remove todas as transações, receitas e despesas
          </Text>
        </TouchableOpacity>
      </View>

      {/* Seção: Conta */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Conta
        </Text>

        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: theme.colors.error,
            },
          ]}
          onPress={handleLogout}
        >
          <Text style={[styles.buttonText, { color: theme.colors.onError }]}>
            Sair
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal de Confirmação */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => !deleting && setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.error }]}>
              ⚠️ CONFIRME A EXCLUSÃO
            </Text>

            <Text style={[styles.modalText, { color: theme.colors.text }]}>
              Digite sua senha para confirmar a exclusão de TODOS os dados:
            </Text>

            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text,
                  borderColor: theme.colors.border
                }
              ]}
              placeholder="Sua senha"
              placeholderTextColor={theme.colors.textTertiary}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!deleting}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  {
                    backgroundColor: theme.colors.surface,
                    borderWidth: 1,
                    borderColor: theme.colors.border
                  }
                ]}
                onPress={() => {
                  setShowDeleteModal(false);
                  setPassword('');
                }}
                disabled={deleting}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  {
                    backgroundColor: theme.colors.error,
                  }
                ]}
                onPress={confirmDeleteAllData}
                disabled={deleting}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.onError }]}>
                  {deleting ? 'Deletando...' : 'Confirmar Exclusão'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Versão */}
      <View style={styles.versionContainer}>
        <Text style={[styles.versionText, { color: theme.colors.textTertiary }]}>
          Finanças App v1.0.0
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  themeOption: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  themeOptionContent: {
    flex: 1,
  },
  themeOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  themeOptionLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  themeOptionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  selectedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedBadgeText: {
    fontSize: 16,
    fontWeight: '700',
  },
  infoBox: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 4,
  },
  infoTextBold: {
    fontWeight: '600',
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  buttonSubtext: {
    fontSize: 12,
    opacity: 0.9,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  modalInput: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  versionText: {
    fontSize: 12,
  },
});

export default SettingsScreen;
