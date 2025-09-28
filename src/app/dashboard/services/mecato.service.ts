import { Injectable } from '@angular/core';
import { Observable, of, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { MecatoExpense } from '../../domain/mecato-expense';
import { MecatoConfig } from '../../domain/mecato-config';

export interface MecatoSummary {
  config: MecatoConfig;
  expenses: MecatoExpense[];
  totalSpent: number;
  remaining: number;
  progressPercentage: number;
}

@Injectable({
  providedIn: 'root'
})
export class MecatoService {

  constructor() { }

  /**
   * Obtiene el resumen completo de mecato del mes
   * En el futuro se conectará a: GET /api/mecato/{month}
   */
  getMecatoSummary(month: string): Observable<MecatoSummary> {
    return combineLatest([
      this.getMecatoConfig(month),
      this.getMecatoExpenses(month)
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
   * Obtiene la configuración de mecato del mes
   * En el futuro se conectará a: GET /api/mecato/config/{month}
   */
  getMecatoConfig(month: string): Observable<MecatoConfig> {
    // Mock data - será reemplazado por llamada HTTP real
    const mockConfig: MecatoConfig = {
      id: 1,
      monthly_budget: 500000,
      month: month
    };
    return of(mockConfig);
  }

  /**
   * Obtiene los gastos de mecato del mes
   * En el futuro se conectará a: GET /api/mecato/expenses/{month}
   */
  getMecatoExpenses(month: string): Observable<MecatoExpense[]> {
    // Mock data - será reemplazado por llamada HTTP real
    const mockMecatoExpenses: MecatoExpense[] = [
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
    return of(mockMecatoExpenses.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ));
  }

  /**
   * Agrega un nuevo gasto de mecato
   * En el futuro se conectará a: POST /api/mecato/expenses
   */
  addMecatoExpense(expense: MecatoExpense): Observable<MecatoExpense> {
    // Mock implementation
    const newExpense: MecatoExpense = {
      ...expense,
      id: Math.floor(Math.random() * 1000) + 100,
      created_at: new Date().toISOString()
    };
    console.log('Adding mecato expense:', newExpense);
    return of(newExpense);
  }

  /**
   * Actualiza un gasto de mecato existente
   * En el futuro se conectará a: PUT /api/mecato/expenses/{id}
   */
  updateMecatoExpense(expense: MecatoExpense): Observable<MecatoExpense> {
    // Mock implementation
    const updatedExpense: MecatoExpense = {
      ...expense,
      created_at: expense.created_at || new Date().toISOString()
    };
    console.log('Updating mecato expense:', updatedExpense);
    return of(updatedExpense);
  }

  /**
   * Elimina un gasto de mecato
   * En el futuro se conectará a: DELETE /api/mecato/expenses/{id}
   */
  deleteMecatoExpense(expenseId: number): Observable<boolean> {
    // Mock implementation
    console.log('Deleting mecato expense:', expenseId);
    return of(true);
  }

  /**
   * Actualiza el presupuesto mensual de mecato
   * En el futuro se conectará a: PUT /api/mecato/config/{month}
   */
  updateMecatoBudget(month: string, budget: number): Observable<MecatoConfig> {
    // Mock implementation
    const updatedConfig: MecatoConfig = {
      id: 1,
      monthly_budget: budget,
      month: month
    };
    console.log('Updating mecato budget:', updatedConfig);
    return of(updatedConfig);
  }

  /**
   * Calcula el total gastado
   */
  calculateTotalSpent(expenses: MecatoExpense[]): number {
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
