// src/screens/SettingsScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { THEME_MODES } from '../config/themes';
import { logout } from '../services/authService';

const SettingsScreen = ({ navigation }) => {
  const { theme, themeMode, isDark, setThemeMode } = useTheme();

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
