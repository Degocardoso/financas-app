// src/context/ThemeContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme, THEME_MODES } from '../config/themes';

// ========================================
// CONTEXTO DE TEMA
// ========================================

const ThemeContext = createContext({
  theme: lightTheme,
  themeMode: THEME_MODES.SYSTEM,
  isDark: false,
  setThemeMode: () => {},
  toggleTheme: () => {},
});

// ========================================
// PROVIDER DE TEMA
// ========================================

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme(); // 'light' ou 'dark' do sistema
  const [themeMode, setThemeModeState] = useState(THEME_MODES.SYSTEM);
  const [theme, setTheme] = useState(lightTheme);
  const [isDark, setIsDark] = useState(false);

  // Carregar preferência salva ao iniciar
  useEffect(() => {
    loadThemePreference();
  }, []);

  // Atualizar tema quando mudar o modo ou o tema do sistema
  useEffect(() => {
    updateTheme();
  }, [themeMode, systemColorScheme]);

  /**
   * Carrega a preferência de tema salva no AsyncStorage
   */
  const loadThemePreference = async () => {
    try {
      const savedThemeMode = await AsyncStorage.getItem('@theme_mode');
      if (savedThemeMode && Object.values(THEME_MODES).includes(savedThemeMode)) {
        setThemeModeState(savedThemeMode);
      }
    } catch (error) {
      console.error('Erro ao carregar preferência de tema:', error);
    }
  };

  /**
   * Salva a preferência de tema no AsyncStorage
   */
  const saveThemePreference = async (mode) => {
    try {
      await AsyncStorage.setItem('@theme_mode', mode);
    } catch (error) {
      console.error('Erro ao salvar preferência de tema:', error);
    }
  };

  /**
   * Atualiza o tema atual baseado no modo selecionado
   */
  const updateTheme = () => {
    let shouldUseDarkTheme = false;

    if (themeMode === THEME_MODES.LIGHT) {
      shouldUseDarkTheme = false;
    } else if (themeMode === THEME_MODES.DARK) {
      shouldUseDarkTheme = true;
    } else if (themeMode === THEME_MODES.SYSTEM) {
      shouldUseDarkTheme = systemColorScheme === 'dark';
    }

    setIsDark(shouldUseDarkTheme);
    setTheme(shouldUseDarkTheme ? darkTheme : lightTheme);
  };

  /**
   * Define o modo de tema e salva a preferência
   */
  const setThemeMode = (mode) => {
    if (!Object.values(THEME_MODES).includes(mode)) {
      console.error('Modo de tema inválido:', mode);
      return;
    }

    setThemeModeState(mode);
    saveThemePreference(mode);
  };

  /**
   * Alterna entre tema claro e escuro (ignora modo sistema)
   */
  const toggleTheme = () => {
    const newMode = themeMode === THEME_MODES.DARK
      ? THEME_MODES.LIGHT
      : THEME_MODES.DARK;

    setThemeMode(newMode);
  };

  const value = {
    theme,
    themeMode,
    isDark,
    setThemeMode,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// ========================================
// HOOK PERSONALIZADO
// ========================================

/**
 * Hook para usar o tema em componentes
 * @returns {{theme: Object, themeMode: string, isDark: boolean, setThemeMode: Function, toggleTheme: Function}}
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }

  return context;
};

// Re-exportar THEME_MODES para conveniência
export { THEME_MODES } from '../config/themes';

export default ThemeContext;
