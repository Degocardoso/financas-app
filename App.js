// App.js
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/config/firebase';
import { ThemeProvider } from './src/context/ThemeContext';

// Screens - Auth
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';

// Screens - Main
import HomeScreen from './src/screens/HomeScreen';
import ImportScreen from './src/screens/ImportScreen';
import RecurringScreen from './src/screens/RecurringScreen';
import ProjectionScreen from './src/screens/ProjectionScreen';

// Screens - New Features
import IncomesScreen from './src/screens/IncomesScreen';
import ExpensesScreen from './src/screens/ExpensesScreen';
import DailyBudgetScreen from './src/screens/DailyBudgetScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Observa mudanças no estado de autenticação
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return null; // Ou um splash screen
  }

  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {user ? (
            // Usuário autenticado - mostra telas do app
            <>
              <Stack.Screen name="Home" component={HomeScreen} />

              {/* Telas Originais */}
              <Stack.Screen name="Import" component={ImportScreen} />
              <Stack.Screen name="Recurring" component={RecurringScreen} />
              <Stack.Screen name="Projection" component={ProjectionScreen} />

              {/* Novas Telas */}
              <Stack.Screen
                name="Incomes"
                component={IncomesScreen}
                options={{ headerShown: true, title: 'Receitas' }}
              />
              <Stack.Screen
                name="Expenses"
                component={ExpensesScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="DailyBudget"
                component={DailyBudgetScreen}
                options={{ headerShown: true, title: 'Despesas Diárias' }}
              />
              <Stack.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{ headerShown: true, title: 'Dashboard' }}
              />
              <Stack.Screen
                name="Settings"
                component={SettingsScreen}
                options={{ headerShown: true, title: 'Configurações' }}
              />
            </>
          ) : (
            // Usuário não autenticado - mostra telas de login
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}
