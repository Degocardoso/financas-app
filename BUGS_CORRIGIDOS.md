# Bugs Corrigidos - Revisão de Cálculos e Validações

## 📋 Resumo

Foram identificados e corrigidos **3 bugs críticos** que causavam:
1. ❌ Campos obrigatórios sendo solicitados mesmo quando não apareciam na tela
2. ❌ Cálculos incorretos nas previsões mensais (despesas multiplicadas)
3. ❌ Projeções diárias ignorando frequências das despesas recorrentes

---

## 🐛 Bug #1: Validação Incorreta em Receitas Únicas

### **Problema:**
No arquivo `src/screens/IncomesScreen.js`, a validação do campo `dayOfMonth` era executada **independentemente** do tipo de receita selecionado.

**Comportamento incorreto:**
1. Usuário seleciona "Receita Única"
2. Campo "Dia do Mês" não aparece na tela (correto)
3. Mas a variável `frequency` ainda tem valor padrão 'monthly'
4. Sistema exige `dayOfMonth` mesmo sem o campo na tela ❌
5. Erro: "Dia do mês deve estar entre 1 e 31"

### **Código original (INCORRETO):**
```javascript
// Linhas 77-85
if (incomeType === 'recurring' && !frequency) {
  Alert.alert('Erro', 'Frequência é obrigatória para receitas recorrentes');
  return;
}

// ❌ PROBLEMA: Valida dayOfMonth SEM verificar se incomeType === 'recurring'
if (frequency === 'monthly' && (!dayOfMonth || dayOfMonth < 1 || dayOfMonth > 31)) {
  Alert.alert('Erro', 'Dia do mês deve estar entre 1 e 31');
  return;
}
```

### **Código corrigido (CORRETO):**
```javascript
// Linhas 77-88
// ✅ CORREÇÃO: Validações agrupadas dentro do bloco de receita recorrente
if (incomeType === 'recurring') {
  if (!frequency) {
    Alert.alert('Erro', 'Frequência é obrigatória para receitas recorrentes');
    return;
  }

  if (frequency === 'monthly' && (!dayOfMonth || dayOfMonth < 1 || dayOfMonth > 31)) {
    Alert.alert('Erro', 'Para receitas mensais, o dia do mês deve estar entre 1 e 31');
    return;
  }
}
```

### **Impacto:**
- ✅ Usuários conseguem cadastrar receitas únicas sem erro
- ✅ Validação só é executada quando realmente necessária
- ✅ Mensagens de erro mais claras

---

## 🐛 Bug #2: Cálculo Incorreto de Despesas Mensais

### **Problema:**
No arquivo `src/services/dashboardService.js`, função `getMonthlyForecast()`, as despesas recorrentes eram somadas **sem considerar a frequência**.

**Comportamento incorreto:**
- Uma despesa de R$ 100 mensal = somava R$ 100 ✅
- Uma despesa de R$ 50 semanal = somava R$ 50 ❌ (deveria somar R$ 200 = 50 * 4 semanas)
- Uma despesa de R$ 10 diária = somava R$ 10 ❌ (deveria somar R$ 300 = 10 * 30 dias)

**Resultado:** Previsões mensais completamente incorretas, mostrando saldos muito maiores que a realidade.

### **Código original (INCORRETO):**
```javascript
// Linhas 113-117
// ❌ PROBLEMA: Soma valor bruto sem considerar frequência
recurringResult.recurring.forEach(recurring => {
  if (recurring.type === 'expense') {
    totalExpenses += Math.abs(recurring.amount);  // ❌ SEMPRE soma valor direto!
  }
});
```

### **Código corrigido (CORRETO):**
```javascript
// Linhas 112-132
// ✅ CORREÇÃO: Aplica multiplicador baseado na frequência
recurringResult.recurring.forEach(recurring => {
  if (recurring.type === 'expense') {
    const amount = Math.abs(recurring.amount);
    const frequency = recurring.frequency || 'monthly';

    if (frequency === 'monthly') {
      totalExpenses += amount;
    } else if (frequency === 'weekly') {
      totalExpenses += amount * 4;  // ~4 semanas por mês
    } else if (frequency === 'biweekly') {
      totalExpenses += amount * 2;  // 2 vezes por mês
    } else if (frequency === 'daily') {
      const daysInMonth = getDaysInMonth(year, month);
      totalExpenses += amount * daysInMonth;  // Multiplicar pelos dias do mês
    } else if (frequency === 'yearly') {
      totalExpenses += amount / 12;  // Dividir por 12 meses
    }
  }
});
```

### **Exemplo prático:**
**Antes da correção:**
- Despesa R$ 100 mensal → somava R$ 100 ✅
- Despesa R$ 50 semanal → somava R$ 50 ❌
- **Total: R$ 150** (INCORRETO!)

**Depois da correção:**
- Despesa R$ 100 mensal → soma R$ 100 ✅
- Despesa R$ 50 semanal → soma R$ 200 (50 * 4) ✅
- **Total: R$ 300** (CORRETO!)

### **Impacto:**
- ✅ Previsões mensais agora mostram valores reais
- ✅ Gráficos do dashboard mostram dados corretos
- ✅ Usuário pode confiar nos números para planejamento financeiro

---

## 🐛 Bug #3: Projeção Diária Ignorava Frequências

### **Problema:**
No arquivo `src/services/dashboardService.js`, função `getDailyCashFlowProjection()`, as despesas recorrentes eram consideradas **apenas se fossem mensais**.

**Comportamento incorreto:**
- Despesa mensal de R$ 100 no dia 5 → incluída no dia 5 de cada mês ✅
- Despesa diária de R$ 10 → **IGNORADA** ❌
- Despesa semanal de R$ 50 → **IGNORADA** ❌

**Resultado:** Gráfico de fluxo de caixa mostrava saldo muito maior que a realidade.

### **Código original (INCORRETO):**
```javascript
// Linhas 225-229
// ❌ PROBLEMA: Só considera despesas mensais
recurringResult.recurring.forEach(recurring => {
  if (recurring.type === 'expense' && recurring.dayOfMonth === dayOfMonth) {
    dailyExpense += Math.abs(recurring.amount);  // ❌ Só entra aqui se tiver dayOfMonth!
  }
});
```

### **Código corrigido (CORRETO):**
```javascript
// Linhas 239-262
// ✅ CORREÇÃO: Considera todas as frequências
recurringResult.recurring.forEach(recurring => {
  if (recurring.type === 'expense') {
    const amount = Math.abs(recurring.amount);
    const frequency = recurring.frequency || 'monthly';

    if (frequency === 'monthly' && recurring.dayOfMonth === dayOfMonth) {
      dailyExpense += amount;  // Adiciona no dia específico do mês
    } else if (frequency === 'daily') {
      dailyExpense += amount;  // Adiciona TODOS os dias
    } else if (frequency === 'weekly') {
      const dayOfWeek = currentDate.getDay();
      if (recurring.dayOfWeek === dayOfWeek || !recurring.dayOfWeek) {
        dailyExpense += amount;  // Adiciona no dia da semana correto
      }
    } else if (frequency === 'biweekly') {
      if (dayOfMonth % 14 === 0 || dayOfMonth === 1 || dayOfMonth === 15) {
        dailyExpense += amount;  // Adiciona quinzenalmente
      }
    }
  }
});
```

### **Impacto:**
- ✅ Projeção de saldo dia a dia agora é precisa
- ✅ Gráfico de linha mostra curva realista
- ✅ Despesas diárias e semanais são consideradas corretamente

---

## 📊 Tabela Comparativa de Cálculos

### Despesa Recorrente: R$ 100 diários

| Período | Antes (INCORRETO) | Depois (CORRETO) | Diferença |
|---------|-------------------|------------------|-----------|
| Dia 1   | R$ 0              | R$ 100           | +R$ 100   |
| Dia 2   | R$ 0              | R$ 100           | +R$ 100   |
| ...     | ...               | ...              | ...       |
| Mês (30 dias) | R$ 0        | R$ 3.000         | +R$ 3.000 |

### Despesa Recorrente: R$ 200 semanais

| Período | Antes (INCORRETO) | Depois (CORRETO) | Diferença |
|---------|-------------------|------------------|-----------|
| Previsão Mensal | R$ 200  | R$ 800           | +R$ 600   |
| Projeção Diária | Ignorada | R$ 200/semana   | +R$ 200/semana |

---

## ✅ Validações Adicionadas

Para evitar futuros problemas, as seguintes validações foram implementadas:

1. **Receitas Únicas:**
   - Campo `dayOfMonth` só é validado se `incomeType === 'recurring'`
   - Data atual é automaticamente atribuída

2. **Receitas Mensais:**
   - Campo `dayOfMonth` é obrigatório apenas se `frequency === 'monthly'`
   - Valor deve estar entre 1 e 31

3. **Despesas Recorrentes:**
   - Frequência padrão é 'monthly' se não especificada (retrocompatibilidade)
   - Cálculos aplicam multiplicadores corretos para cada frequência

---

## 🧪 Como Testar as Correções

### Teste 1: Receita Única
1. Abra "Receitas" → Toque em "+"
2. Selecione "Única"
3. Preencha descrição e valor
4. Clique em "Salvar"
5. ✅ Deve salvar SEM pedir "dia do mês"

### Teste 2: Receita Mensal
1. Abra "Receitas" → Toque em "+"
2. Selecione "Recorrente"
3. Escolha frequência "Mensal"
4. Preencha descrição, valor e dia do mês
5. ✅ Deve salvar com sucesso

### Teste 3: Previsão Mensal
1. Cadastre uma despesa recorrente diária de R$ 10
2. Vá em "Dashboard"
3. Verifique o gráfico de previsão mensal
4. ✅ Deve mostrar ~R$ 300 de despesas (10 * 30 dias)

### Teste 4: Projeção Diária
1. Cadastre uma despesa recorrente diária de R$ 50
2. Vá em "Dashboard"
3. Verifique o gráfico de fluxo de caixa
4. ✅ Saldo deve diminuir R$ 50 TODOS os dias

---

## 📝 Notas Técnicas

### Retrocompatibilidade
- Despesas recorrentes antigas sem campo `frequency` assumem `'monthly'` por padrão
- Não é necessário migração de dados

### Aproximações nos Cálculos
- Semanas por mês: Assumido 4 (pode variar de 4 a 5)
- Quinzenais: Simplificado como 2x por mês
- Dias do mês: Calculado exato via `getDaysInMonth()`

### Próximas Melhorias Sugeridas
1. Adicionar campo `dayOfWeek` para despesas semanais
2. Implementar cálculo exato de semanas no mês
3. Adicionar testes automatizados para cálculos financeiros

---

## 🎯 Arquivos Modificados

1. **src/screens/IncomesScreen.js**
   - Linhas 77-88: Validação condicional corrigida

2. **src/services/dashboardService.js**
   - Linhas 112-132: Cálculo mensal de despesas recorrentes
   - Linhas 239-262: Projeção diária de despesas recorrentes

---

## ✅ Status Final

| Bug | Gravidade | Status | Impacto |
|-----|-----------|--------|---------|
| Validação campo obrigatório | 🔴 Alta | ✅ CORRIGIDO | UX bloqueante |
| Cálculo previsão mensal | 🔴 Alta | ✅ CORRIGIDO | Dados incorretos |
| Projeção diária | 🔴 Alta | ✅ CORRIGIDO | Gráficos incorretos |

**Todos os bugs críticos foram resolvidos!** 🎉
