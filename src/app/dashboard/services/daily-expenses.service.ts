import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, combineLatest, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { DailyExpense } from '../../domain/daily-expense';
import { DailyExpensesConfig } from '../../domain/daily-expenses-config';
import { environment } from '../../../environments/environment';

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

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  /**
   * Obtiene el resumen completo de gastos diarios del mes
   * Combina configuración y gastos desde el backend
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
      }),
      catchError(error => {
        console.error('Error obteniendo resumen de gastos diarios:', error);
        return throwError(() => new Error(`Error cargando resumen de gastos diarios: ${error.message || 'Error de conexión'}`));
      })
    );
  }

  /**
   * Obtiene la configuración de gastos diarios del mes desde el backend
   * GET /api/daily-expenses/config/{month}
   */
  getDailyExpensesConfig(month: string): Observable<DailyExpensesConfig> {
    const url = `${environment.dailyExpensesConfigUrl}/${month}`;
    console.log('Obteniendo configuración de gastos diarios desde:', url);

    return this.http.get<DailyExpensesConfig>(url).pipe(
      map(response => {
        console.log('Configuración de gastos diarios obtenida exitosamente:', response);
        
        // Asegurar que la respuesta tenga la estructura correcta
        return {
          ...response,
          month: response.month || month,
          monthly_budget: response.monthly_budget || 0
        };
      }),
      catchError(error => {
        console.error('Error obteniendo configuración de gastos diarios del backend:', error);
        console.error('URL utilizada:', url);
        
        // Propagar el error sin fallback
        return throwError(() => new Error(`Error cargando configuración de gastos diarios: ${error.message || 'Error de conexión'}`));
      })
    );
  }

  /**
   * Obtiene los gastos diarios del mes desde el backend
   * GET /api/daily-expenses/{month}
   */
  getDailyExpenses(month: string): Observable<DailyExpense[]> {
    const url = `${environment.dailyExpensesUrl}/${month}`;
    console.log('Obteniendo gastos diarios desde:', url);

    return this.http.get<DailyExpense[]>(url).pipe(
      map(response => {
        console.log('Gastos diarios obtenidos exitosamente:', response);
        
        // Validar que la respuesta sea un array
        if (!Array.isArray(response)) {
          throw new Error('La respuesta del servidor no es un array válido');
        }

        // Ordenar por fecha descendente y asegurar estructura correcta
        return response
          .map(expense => ({
            ...expense,
            created_at: expense.created_at || new Date().toISOString()
          }))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      }),
      catchError(error => {
        console.error('Error obteniendo gastos diarios del backend:', error);
        console.error('URL utilizada:', url);
        
        // Propagar el error sin fallback
        return throwError(() => new Error(`Error cargando gastos diarios: ${error.message || 'Error de conexión'}`));
      })
    );
  }

  /**
   * Agrega un nuevo gasto diario
   * POST /api/daily-expenses/expenses
   */
  addDailyExpense(expense: DailyExpense): Observable<DailyExpense> {
    const url = environment.dailyExpensesUrl;
    console.log('Agregando gasto diario:', expense);

    const body = {
      description: expense.description,
      amount: expense.amount,
      date: expense.date
    };

    return this.http.post<DailyExpense>(url, body, this.httpOptions).pipe(
      map(response => {
        console.log('Gasto diario agregado exitosamente:', response);
        
        // Asegurar que la respuesta tenga la estructura correcta
        return {
          ...response,
          created_at: response.created_at || new Date().toISOString()
        };
      }),
      catchError(error => {
        console.error('Error agregando gasto diario:', error);
        console.error('URL utilizada:', url);
        
        // Propagar el error sin fallback
        return throwError(() => new Error(`Error agregando gasto diario: ${error.message || 'Error de conexión'}`));
      })
    );
  }

  /**
   * Actualiza un gasto diario existente
   * PUT /api/daily-expenses/{id}
   */
  updateDailyExpense(expense: DailyExpense): Observable<DailyExpense> {
    const url = `${environment.dailyExpensesUrl}/${expense.id}`;
    console.log('Actualizando gasto diario:', expense);

    const body = {
      description: expense.description,
      amount: expense.amount,
      date: expense.date
    };

    return this.http.put<DailyExpense>(url, body, this.httpOptions).pipe(
      map(response => {
        console.log('Gasto diario actualizado exitosamente:', response);
        
        // Asegurar que la respuesta tenga la estructura correcta
        return {
          ...response,
          created_at: response.created_at || expense.created_at || new Date().toISOString()
        };
      }),
      catchError(error => {
        console.error('Error actualizando gasto diario:', error);
        console.error('URL utilizada:', url);
        
        // Propagar el error sin fallback
        return throwError(() => new Error(`Error actualizando gasto diario: ${error.message || 'Error de conexión'}`));
      })
    );
  }

  /**
   * Elimina un gasto diario
   * DELETE /api/daily-expenses/{id}
   */
  deleteDailyExpense(expenseId: number): Observable<boolean> {
    const url = `${environment.dailyExpensesUrl}/${expenseId}`;
    console.log('Eliminando gasto diario:', expenseId);

    return this.http.delete<{success: boolean}>(url).pipe(
      map(response => {
        console.log('Gasto diario eliminado exitosamente:', response);
        return response.success || true;
      }),
      catchError(error => {
        console.error('Error eliminando gasto diario:', error);
        console.error('URL utilizada:', url);
        
        // Propagar el error sin fallback
        return throwError(() => new Error(`Error eliminando gasto diario: ${error.message || 'Error de conexión'}`));
      })
    );
  }

  /**
   * Actualiza el presupuesto mensual de gastos diarios
   * PUT /api/daily-expenses/config/{month}
   */
  updateDailyExpensesBudget(month: string, budget: number): Observable<DailyExpensesConfig> {
    const url = `${environment.dailyExpensesConfigUrl}/${month}`;
    console.log('Actualizando presupuesto de gastos diarios:', budget);

    const body = { monthly_budget: budget };

    return this.http.put<DailyExpensesConfig>(url, body, this.httpOptions).pipe(
      map(response => {
        console.log('Presupuesto de gastos diarios actualizado exitosamente:', response);
        
        // Asegurar que la respuesta tenga la estructura correcta
        return {
          ...response,
          month: response.month || month,
          monthly_budget: response.monthly_budget || budget
        };
      }),
      catchError(error => {
        console.error('Error actualizando presupuesto de gastos diarios:', error);
        console.error('URL utilizada:', url);
        
        // Propagar el error sin fallback
        return throwError(() => new Error(`Error actualizando presupuesto: ${error.message || 'Error de conexión'}`));
      })
    );
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

  /**
   * Maneja errores HTTP de manera consistente
   */
  private handleHttpError(error: any): void {
    if (error.status === 0) {
      console.error('Error de red - No se puede conectar al servidor');
    } else if (error.status >= 400 && error.status < 500) {
      console.error('Error del cliente:', error.status, error.message);
    } else if (error.status >= 500) {
      console.error('Error del servidor:', error.status, error.message);
    }
  }
}