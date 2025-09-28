import { Injectable } from '@angular/core';
import { Observable, of, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { DailyExpense } from '../../domain/daily-expense';
import { DailyExpensesConfig } from '../../domain/daily-expenses-config';

export interface DailyExpensesSummary {
  config: DailyExpensesConfig;
  expenses: DailyExpense[];
  totalSpent: number;
  remaining: number;
  progressPercentage: number;
}

@Injectable({
  providedIn: 'root'
})
export class DailyExpensesService {

  constructor() { }

  /**
   * Obtiene el resumen completo de gastos diarios del mes
   * En el futuro se conectará a: GET /api/daily-expenses/{month}
   */
  getDailyExpensesSummary(month: string): Observable<DailyExpensesSummary> {
    return combineLatest([
      this.getDailyExpensesConfig(month),
      this.getDailyExpenses(month)
    ]).pipe(
      map(([config, expenses]) => {
        const totalSpent = this.calculateTotalSpent(expenses);
        const remaining = config.monthly_budget - totalSpent;
        const progressPercentage = config.monthly_budget > 0 
          ? (totalSpent / config.monthly_budget) * 100 
          : 0;

        return {
          config,
          expenses,
          totalSpent,
          remaining,
          progressPercentage
        };
      })
    );
  }

  /**
   * Obtiene la configuración de gastos diarios del mes
   * En el futuro se conectará a: GET /api/daily-expenses/config/{month}
   */
  getDailyExpensesConfig(month: string): Observable<DailyExpensesConfig> {
    // Mock data - será reemplazado por llamada HTTP real
    const mockConfig: DailyExpensesConfig = {
      id: 1,
      monthly_budget: 500000,
      month: month
    };
    return of(mockConfig);
  }

  /**
   * Obtiene los gastos diarios del mes
   * En el futuro se conectará a: GET /api/daily-expenses/expenses/{month}
   */
  getDailyExpenses(month: string): Observable<DailyExpense[]> {
    // Mock data - será reemplazado por llamada HTTP real
    const mockDailyExpenses: DailyExpense[] = [
      {
        id: 1,
        description: 'Café en Juan Valdez',
        amount: 8500,
        date: '2024-01-15',
        created_at: '2024-01-15T10:30:00Z'
      },
      {
        id: 2,
        description: 'Almuerzo con mi esposa',
        amount: 45000,
        date: '2024-01-14',
        created_at: '2024-01-14T13:15:00Z'
      },
      {
        id: 3,
        description: 'Libro "Cien años de soledad"',
        amount: 35000,
        date: '2024-01-13',
        created_at: '2024-01-13T16:45:00Z'
      },
      {
        id: 4,
        description: 'Helado para mi hija',
        amount: 12000,
        date: '2024-01-12',
        created_at: '2024-01-12T18:20:00Z'
      },
      {
        id: 5,
        description: 'Cine familiar',
        amount: 85000,
        date: '2024-01-11',
        created_at: '2024-01-11T20:00:00Z'
      },
      {
        id: 6,
        description: 'Dulces en la tienda',
        amount: 6500,
        date: '2024-01-10',
        created_at: '2024-01-10T15:30:00Z'
      }
    ];

    // Ordenar por fecha descendente
    return of(mockDailyExpenses.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ));
  }

  /**
   * Agrega un nuevo gasto diario
   * En el futuro se conectará a: POST /api/daily-expenses/expenses
   */
  addDailyExpense(expense: DailyExpense): Observable<DailyExpense> {
    // Mock implementation
    const newExpense: DailyExpense = {
      ...expense,
      id: Math.floor(Math.random() * 1000) + 100,
      created_at: new Date().toISOString()
    };
    console.log('Adding daily expense:', newExpense);
    return of(newExpense);
  }

  /**
   * Actualiza un gasto diario existente
   * En el futuro se conectará a: PUT /api/daily-expenses/expenses/{id}
   */
  updateDailyExpense(expense: DailyExpense): Observable<DailyExpense> {
    // Mock implementation
    const updatedExpense: DailyExpense = {
      ...expense,
      created_at: expense.created_at || new Date().toISOString()
    };
    console.log('Updating daily expense:', updatedExpense);
    return of(updatedExpense);
  }

  /**
   * Elimina un gasto diario
   * En el futuro se conectará a: DELETE /api/daily-expenses/expenses/{id}
   */
  deleteDailyExpense(expenseId: number): Observable<boolean> {
    // Mock implementation
    console.log('Deleting daily expense:', expenseId);
    return of(true);
  }

  /**
   * Actualiza el presupuesto mensual de gastos diarios
   * En el futuro se conectará a: PUT /api/daily-expenses/config/{month}
   */
  updateDailyExpensesBudget(month: string, budget: number): Observable<DailyExpensesConfig> {
    // Mock implementation
    const updatedConfig: DailyExpensesConfig = {
      id: 1,
      monthly_budget: budget,
      month: month
    };
    console.log('Updating daily expenses budget:', updatedConfig);
    return of(updatedConfig);
  }

  /**
   * Calcula el total gastado
   */
  calculateTotalSpent(expenses: DailyExpense[]): number {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }

  /**
   * Obtiene el color de la barra de progreso según el porcentaje
   */
  getProgressColor(percentage: number): 'primary' | 'accent' | 'warn' {
    if (percentage >= 90) return 'warn';
    if (percentage >= 70) return 'accent';
    return 'primary';
  }
}