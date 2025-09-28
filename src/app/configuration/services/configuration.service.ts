import { Injectable } from '@angular/core';
import { Observable, of, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

import { Salary } from '../../domain/salary';
import { FixedExpense } from '../../domain/fixed-expense';
import { DailyExpensesConfig } from '../../domain/daily-expenses-config';
import { Pocket } from '../../domain/pocket';
import { MockDataService } from '../../services/mock-data.service';

export interface FinancialConfiguration {
  salary: Salary;
  pockets: Pocket[];
  fixedExpenses: FixedExpense[];
  dailyExpensesConfig: DailyExpensesConfig;
}

export interface CreateFixedExpenseRequest {
  pocket_name: string;
  concept_name: string;
  amount: number;
  payment_day: number;
}

export interface UpdateSalaryRequest {
  monthly_amount: number;
}

export interface UpdateDailyBudgetRequest {
  monthly_budget: number;
}

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {

  constructor(private mockDataService: MockDataService) { }

  /**
   * Obtiene toda la configuración financiera del mes
   * En el futuro se conectará a: GET /api/configuration/{month}
   */
  getFinancialConfiguration(month: string): Observable<FinancialConfiguration> {
    return forkJoin({
      salary: this.mockDataService.getSalary(month),
      fixedExpenses: this.mockDataService.getFixedExpenses(month),
      dailyExpensesConfig: this.mockDataService.getDailyExpensesConfig(month)
    }).pipe(
      map(({ salary, fixedExpenses, dailyExpensesConfig }) => {
        // Extract unique pockets from fixed expenses
        const pockets = this.extractPocketsFromExpenses(fixedExpenses);
        
        return {
          salary,
          pockets,
          fixedExpenses,
          dailyExpensesConfig
        };
      })
    );
  }

  /**
   * Actualiza el salario mensual
   * En el futuro se conectará a: PUT /api/salary/{month}
   */
  updateSalary(month: string, request: UpdateSalaryRequest): Observable<Salary> {
    // Mock implementation
    const updatedSalary: Salary = {
      id: 1,
      monthly_amount: request.monthly_amount,
      month: month,
      created_at: new Date().toISOString()
    };
    console.log('Updating salary:', updatedSalary);
    return of(updatedSalary);
  }

  /**
   * Actualiza el presupuesto de gastos diarios
   * En el futuro se conectará a: PUT /api/daily-expenses/budget/{month}
   */
  updateDailyBudget(month: string, request: UpdateDailyBudgetRequest): Observable<DailyExpensesConfig> {
    // Mock implementation
    const updatedConfig: DailyExpensesConfig = {
      id: 1,
      monthly_budget: request.monthly_budget,
      month: month
    };
    console.log('Updating daily budget:', updatedConfig);
    return of(updatedConfig);
  }

  /**
   * Crea un nuevo gasto fijo
   * En el futuro se conectará a: POST /api/fixed-expenses
   */
  createFixedExpense(month: string, request: CreateFixedExpenseRequest): Observable<FixedExpense> {
    // Mock implementation
    const newExpense: FixedExpense = {
      id: Math.floor(Math.random() * 1000) + 100,
      pocket_name: request.pocket_name,
      concept_name: request.concept_name,
      amount: request.amount,
      payment_day: request.payment_day,
      is_paid: false,
      month: month,
      created_at: new Date().toISOString()
    };
    console.log('Creating fixed expense:', newExpense);
    return of(newExpense);
  }

  /**
   * Actualiza un gasto fijo existente
   * En el futuro se conectará a: PUT /api/fixed-expenses/{id}
   */
  updateFixedExpense(expense: FixedExpense): Observable<FixedExpense> {
    // Mock implementation
    const updatedExpense: FixedExpense = {
      ...expense,
      created_at: expense.created_at || new Date().toISOString()
    };
    console.log('Updating fixed expense:', updatedExpense);
    return of(updatedExpense);
  }

  /**
   * Elimina un gasto fijo
   * En el futuro se conectará a: DELETE /api/fixed-expenses/{id}
   */
  deleteFixedExpense(expenseId: number): Observable<boolean> {
    // Mock implementation
    console.log('Deleting fixed expense:', expenseId);
    return of(true);
  }

  /**
   * Crea un nuevo bolsillo
   * En el futuro se conectará a: POST /api/pockets
   */
  createPocket(name: string, description?: string): Observable<Pocket> {
    // Mock implementation
    const newPocket: Pocket = {
      id: Math.floor(Math.random() * 1000) + 100,
      name: name,
      description: description,
      created_at: new Date().toISOString()
    };
    console.log('Creating pocket:', newPocket);
    return of(newPocket);
  }

  /**
   * Extrae bolsillos únicos de los gastos fijos
   */
  private extractPocketsFromExpenses(expenses: FixedExpense[]): Pocket[] {
    const pocketNames = [...new Set(expenses.map(e => e.pocket_name))];
    return pocketNames.map((name, index) => ({
      id: index + 1,
      name: name,
      description: `Bolsillo para gastos de ${name.toLowerCase()}`
    }));
  }

  /**
   * Obtiene los bolsillos disponibles
   */
  getAvailablePockets(): Observable<Pocket[]> {
    // Mock implementation - en el futuro será: GET /api/pockets
    const mockPockets: Pocket[] = [
      { id: 1, name: 'Vivienda', description: 'Gastos relacionados con la vivienda' },
      { id: 2, name: 'Transporte', description: 'Gastos de transporte y vehículo' },
      { id: 3, name: 'Alimentación', description: 'Gastos de comida y mercado' },
      { id: 4, name: 'Salud', description: 'Gastos médicos y de salud' },
      { id: 5, name: 'Educación', description: 'Gastos educativos y capacitación' },
      { id: 6, name: 'Entretenimiento', description: 'Gastos de ocio y entretenimiento' }
    ];
    return of(mockPockets);
  }
}