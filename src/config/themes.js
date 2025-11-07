// src/config/themes.js

// ========================================
// TEMA CLARO (Light Theme)
// ========================================
export const lightTheme = {
  // Identificação
  mode: 'light',

  // Cores principais
  colors: {
    // Fundo
    background: '#F5F7FA',           // Fundo principal (cinza muito claro)
    surface: '#FFFFFF',              // Cartões e superfícies elevadas
    surfaceVariant: '#F0F2F5',       // Variação de superfície

    // Texto
    text: '#1A1A2E',                 // Texto principal (quase preto)
    textSecondary: '#6B7280',        // Texto secundário (cinza médio)
    textTertiary: '#9CA3AF',         // Texto terciário (cinza claro)

    // Primária (azul moderno)
    primary: '#3B82F6',              // Azul principal
    primaryDark: '#2563EB',          // Azul escuro
    primaryLight: '#60A5FA',         // Azul claro
    onPrimary: '#FFFFFF',            // Texto em primária

    // Secundária (roxo)
    secondary: '#8B5CF6',            // Roxo
    secondaryDark: '#7C3AED',        // Roxo escuro
    secondaryLight: '#A78BFA',       // Roxo claro
    onSecondary: '#FFFFFF',          // Texto em secundária

    // Sucesso (verde)
    success: '#10B981',              // Verde sucesso
    successLight: '#34D399',         // Verde claro
    successDark: '#059669',          // Verde escuro
    onSuccess: '#FFFFFF',            // Texto em sucesso

    // Erro (vermelho)
    error: '#EF4444',                // Vermelho erro
    errorLight: '#F87171',           // Vermelho claro
    errorDark: '#DC2626',            // Vermelho escuro
    onError: '#FFFFFF',              // Texto em erro

    // Aviso (amarelo/laranja)
    warning: '#F59E0B',              // Laranja aviso
    warningLight: '#FBBF24',         // Laranja claro
    warningDark: '#D97706',          // Laranja escuro
    onWarning: '#FFFFFF',            // Texto em aviso

    // Info (ciano)
    info: '#06B6D4',                 // Ciano info
    infoLight: '#22D3EE',            // Ciano claro
    infoDark: '#0891B2',             // Ciano escuro
    onInfo: '#FFFFFF',               // Texto em info

    // Bordas
    border: '#E5E7EB',               // Borda padrão
    borderLight: '#F3F4F6',          // Borda clara
    borderDark: '#D1D5DB',           // Borda escura

    // Sombras
    shadow: 'rgba(0, 0, 0, 0.1)',    // Sombra padrão
    shadowLight: 'rgba(0, 0, 0, 0.05)',   // Sombra clara
    shadowDark: 'rgba(0, 0, 0, 0.15)',    // Sombra escura

    // Overlays
    overlay: 'rgba(0, 0, 0, 0.5)',   // Overlay escuro
    overlayLight: 'rgba(0, 0, 0, 0.3)',   // Overlay claro

    // Gráficos
    chartPositive: '#10B981',        // Verde para valores positivos
    chartNegative: '#EF4444',        // Vermelho para valores negativos
    chartNeutral: '#6B7280',         // Cinza para neutro
  },

  // Espaçamentos
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  // Bordas arredondadas
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    round: 999,
  },

  // Tamanhos de fonte
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },

  // Pesos de fonte
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

// ========================================
// TEMA ESCURO (Dark Theme)
// ========================================
export const darkTheme = {
  // Identificação
  mode: 'dark',

  // Cores principais
  colors: {
    // Fundo
    background: '#0F172A',           // Fundo principal (azul muito escuro)
    surface: '#1E293B',              // Cartões e superfícies elevadas
    surfaceVariant: '#334155',       // Variação de superfície

    // Texto
    text: '#F1F5F9',                 // Texto principal (branco suave)
    textSecondary: '#CBD5E1',        // Texto secundário (cinza claro)
    textTertiary: '#94A3B8',         // Texto terciário (cinza)

    // Primária (azul moderno - mais claro no dark)
    primary: '#60A5FA',              // Azul principal
    primaryDark: '#3B82F6',          // Azul escuro
    primaryLight: '#93C5FD',         // Azul claro
    onPrimary: '#0F172A',            // Texto em primária

    // Secundária (roxo - mais claro no dark)
    secondary: '#A78BFA',            // Roxo
    secondaryDark: '#8B5CF6',        // Roxo escuro
    secondaryLight: '#C4B5FD',       // Roxo claro
    onSecondary: '#0F172A',          // Texto em secundária

    // Sucesso (verde - mais claro no dark)
    success: '#34D399',              // Verde sucesso
    successLight: '#6EE7B7',         // Verde claro
    successDark: '#10B981',          // Verde escuro
    onSuccess: '#0F172A',            // Texto em sucesso

    // Erro (vermelho - mais claro no dark)
    error: '#F87171',                // Vermelho erro
    errorLight: '#FCA5A5',           // Vermelho claro
    errorDark: '#EF4444',            // Vermelho escuro
    onError: '#0F172A',              // Texto em erro

    // Aviso (amarelo/laranja - mais claro no dark)
    warning: '#FBBF24',              // Laranja aviso
    warningLight: '#FCD34D',         // Laranja claro
    warningDark: '#F59E0B',          // Laranja escuro
    onWarning: '#0F172A',            // Texto em aviso

    // Info (ciano - mais claro no dark)
    info: '#22D3EE',                 // Ciano info
    infoLight: '#67E8F9',            // Ciano claro
    infoDark: '#06B6D4',             // Ciano escuro
    onInfo: '#0F172A',               // Texto em info

    // Bordas
    border: '#475569',               // Borda padrão
    borderLight: '#64748B',          // Borda clara
    borderDark: '#334155',           // Borda escura

    // Sombras
    shadow: 'rgba(0, 0, 0, 0.3)',    // Sombra padrão
    shadowLight: 'rgba(0, 0, 0, 0.2)',    // Sombra clara
    shadowDark: 'rgba(0, 0, 0, 0.4)',     // Sombra escura

    // Overlays
    overlay: 'rgba(0, 0, 0, 0.7)',   // Overlay escuro
    overlayLight: 'rgba(0, 0, 0, 0.5)',   // Overlay claro

    // Gráficos
    chartPositive: '#34D399',        // Verde para valores positivos
    chartNegative: '#F87171',        // Vermelho para valores negativos
    chartNeutral: '#94A3B8',         // Cinza para neutro
  },

  // Espaçamentos (iguais ao tema claro)
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  // Bordas arredondadas (iguais ao tema claro)
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    round: 999,
  },

  // Tamanhos de fonte (iguais ao tema claro)
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },

  // Pesos de fonte (iguais ao tema claro)
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

// ========================================
// TIPOS DE TEMA
// ========================================
export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};
