// Storage Keys
    const STORAGE_KEYS = {
      INCOME: "finance_manager_income",
      SAVINGS_TARGET: "finance_manager_savings_target",
      EXPENSES: "finance__expenses"
    };

    // DOM Elements
    const incomeInput = document.getElementById("income");
    const savingsTargetInput = document.getElementById("savings-target");
    const updateIncomeBtn = document.getElementById("update-income");
    const expenseForm = document.getElementById("expense-form");
    const expenseTableBody = document.getElementById("expense-table-body");
    const totalIncomeDisplay = document.getElementById("total-income");
    const totalSavingsDisplay = document.getElementById("total-savings");
    const totalExpensesDisplay = document.getElementById("total-expenses");
    const toggleThemeBtn = document.getElementById("toggle-theme");
    const expenseChartCtx = document.getElementById("expense-chart");
    const savingsChartCtx = document.getElementById("savings-chart");

    // State Variables
    let income = 0;
    let savingsTarget = 20; // Default savings percentage
    let expenses = [];

    // Initialize Charts
    let expenseChart, savingsChart;

    // ===== UTILITY FUNCTIONS ===== //
    function formatCurrency(amount) {
      return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
    }
    function calculateSavings() {
      return income * (savingsTarget / 100);
    }
    function calculateExpensesTotal() {
      return expenses.reduce((sum, expense) => sum + expense.amount, 0);
    }
    function getRemainingBalance() {
      return income - calculateSavings() - calculateExpensesTotal();
    }

    // ===== STORAGE FUNCTIONS ===== //
    function saveIncome(value) {
      localStorage.setItem(STORAGE_KEYS.INCOME, JSON.stringify(value));
    }
    function saveSavingsTarget(value) {
      localStorage.setItem(STORAGE_KEYS.SAVINGS_TARGET, JSON.stringify(value));
    }
    function saveExpenses(expenses) {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    }
    function loadData() {
      const savedIncome = localStorage.getItem(STORAGE_KEYS.INCOME);
      income = savedIncome ? JSON.parse(savedIncome) : 0;
      const savedSavingsTarget = localStorage.getItem(STORAGE_KEYS.SAVINGS_TARGET);
      savingsTarget = savedSavingsTarget ? JSON.parse(savedSavingsTarget) : 20;
      const savedExpenses = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      expenses = savedExpenses ? JSON.parse(savedExpenses) : [];
      updateUI();
    }

    // ===== UI UPDATE FUNCTIONS ===== //
    function updateIncomeSection() {
      incomeInput.value = income;
      savingsTargetInput.value = savingsTarget;
    }

    function updateSummary() {
      const savings = calculateSavings();
      const totalExpenses = calculateExpensesTotal();
      totalIncomeDisplay.textContent = formatCurrency(income);
      totalSavingsDisplay.textContent = `${formatCurrency(savings)} (${savingsTarget}%)`;
      totalExpensesDisplay.textContent = formatCurrency(totalExpenses);
    }

    function renderExpensesTable() {
      expenseTableBody.innerHTML = "";
      expenses.forEach((expense, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${expense.date}</td>
          <td>${expense.category}</td>
          <td>${formatCurrency(expense.amount)}</td>
          <td>
            <button onclick="deleteExpense(${index})" class="delete-btn">Delete</button>
          </td>
        `;
        expenseTableBody.appendChild(row);
      });
    }

    function updateCharts() {
      const categories = [...new Set(expenses.map(e => e.category))];
      const categoryTotals = {};
      categories.forEach(cat => {
        categoryTotals[cat] = expenses
          .filter(e => e.category === cat)
          .reduce((sum, e) => sum + e.amount, 0);
      });

      if (expenseChart) expenseChart.destroy();
      expenseChart = new Chart(expenseChartCtx, {
        type: 'pie',
        data: {
          labels: Object.keys(categoryTotals),
          datasets: [{
            data: Object.values(categoryTotals),
            backgroundColor: [
              '#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'
            ]
          }]
        },
        options: {
          plugins: { title: { display: true, text: 'Expenses by Category' } }
        }
      });

      if (savingsChart) savingsChart.destroy();
      savingsChart = new Chart(savingsChartCtx, {
        type: 'doughnut',
        data: {
          labels: ['Savings', 'Expenses', 'Remaining'],
          datasets: [{
            data: [calculateSavings(), calculateExpensesTotal(), getRemainingBalance()],
            backgroundColor: ['#10b981', '#ef4444', '#3b82f6']
          }]
        },
        options: {
          plugins: { title: { display: true, text: 'Money Allocation' } }
        }
      });
    }

    function updateUI() {
      updateIncomeSection();
      updateSummary();
      renderExpensesTable();
      updateCharts();
      checkBudgetAlert(); // <-- Call alert check after UI update
    }

    // ===== EVENT HANDLERS ===== //
    function handleIncomeUpdate(e) {
      e.preventDefault();
      income = parseFloat(incomeInput.value) || 0;
      savingsTarget = parseFloat(savingsTargetInput.value) || 20;
      saveIncome(income);
      saveSavingsTarget(savingsTarget);
      updateUI();
    }

    function handleAddExpense(e) {
      e.preventDefault();
      const date = document.getElementById("expense-date").value;
      const category = document.getElementById("expense-category").value;
      const amount = parseFloat(document.getElementById("expense-amount").value);

      if (!date || !category || isNaN(amount) || amount <= 0) {
        alert("Please fill all fields correctly");
        return;
      }

      expenses.push({ date, category, amount });
      saveExpenses(expenses);
      updateUI();
      expenseForm.reset();
    }

    function deleteExpense(index) {
      if (confirm("Are you sure you want to delete this expense?")) {
        expenses.splice(index, 1);
        saveExpenses(expenses);
        updateUI();
      }
    }
  
  function checkBudgetAlert() {
    // Use actual state variables
    const totalExpenses = calculateExpensesTotal();
    const threshold = income * 0.8;
    const alertBox = document.getElementById('budget-alert');
    if (totalExpenses > threshold && income > 0) {
      alertBox.classList.remove('hidden');
    } else {
      alertBox.classList.add('hidden');
    }
  }

    function toggleTheme() {
      const currentTheme = document.body.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.body.setAttribute('data-theme', newTheme);
    }

    // ===== INITIALIZATION ===== //
    function init() {
      loadData();
      updateIncomeBtn.addEventListener('click', handleIncomeUpdate);
      expenseForm.addEventListener('submit', handleAddExpense);
      toggleThemeBtn.addEventListener('click', toggleTheme);
      updateUI();
    }
    window.deleteExpense = deleteExpense;

    init();

