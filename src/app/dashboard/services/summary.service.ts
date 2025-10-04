import { Injectable } from '@angular/core';
import { Observable, forkJoin, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { Salary } from '../../domain/salary';
import { FixedExpense } from '../../domain/fixed-expense';
import { DailyExpensesConfig } from '../../domain/daily-expenses-config';
import { DailyExpense } from '../../domain/daily-expense';
import { ConfigurationService } from '../../configuration/services/configuration.service';
import { FixedExpensesService } from './fixed-expenses.service';
import { DailyExpensesService } from './daily-expenses.service';

export interface MonthlySummary {
  salary: Salary;
  totalFixedExpenses: number;
  dailyExpensesBudget: DailyExpensesConfig;
  totalDailySpent: number;
  availableAfterFixed: number;
  availableOverall: number;
  fixedExpensesPercentage: number;
  dailyBudgetPercentage: number;
  overallBalanceStatus: 'surplus' | 'deficit' | 'balanced';
}

@Injectable({
  providedIn: 'root'
})
export class SummaryService {

  constructor(
    private configurationService: ConfigurationService,
    private fixedExpensesService: FixedExpensesService,
    private dailyExpensesService: DailyExpensesService
  ) { }

  /**
   * Obtiene el resumen mensual completo desde el backend
   */
  getMonthlySummary(month: string): Observable<MonthlySummary> {
    console.log('Obteniendo resumen mensual para:', month);

    return forkJoin({
      salary: this.configurationService.getSalary(month),
      fixedExpenses: this.fixedExpensesService.getFixedExpenses(month),
      dailyExpensesConfig: this.configurationService.getDailyExpensesConfig(month),
      dailyExpenses: this.dailyExpensesService.getDailyExpenses(month)
    }).pipe(
      map(({ salary, fixedExpenses, dailyExpensesConfig, dailyExpenses }) => {
        console.log('Datos obtenidos para resumen:', {
          salary,
          fixedExpenses: fixedExpenses.length,
          dailyExpensesConfig,
          dailyExpenses: dailyExpenses.length
        });

        // Calcular total de gastos fijos (solo los no pagados para el cálculo de disponible)
        const totalFixedExpenses = fixedExpenses
          .filter(e => !e.is_paid)
          .reduce((sum, expense) => sum + expense.amount, 0);

        // Calcular total gastado en gastos diarios
        const totalDailySpent = dailyExpenses.reduce((sum, expense) => sum + expense.amount, 0);

        // Calcular disponible después de gastos fijos
        const availableAfterFixed = salary.monthly_amount - totalFixedExpenses;

        // Calcular disponible general (después de gastos fijos y presupuesto diario)
        const availableOverall = availableAfterFixed - (dailyExpensesConfig.monthly_budget || 0);

        // Calcular porcentajes
        const fixedExpensesPercentage = salary.monthly_amount > 0
          ? (totalFixedExpenses / salary.monthly_amount) * 100
          : 0;

        const dailyBudgetPercentage = salary.monthly_amount > 0
          ? ((dailyExpensesConfig.monthly_budget || 0) / salary.monthly_amount) * 100
          : 0;

        // Determinar estado del balance general
        let overallBalanceStatus: 'surplus' | 'deficit' | 'balanced' = 'balanced';
        if (availableOverall > 1000) { // Margen de 1000 para considerar "balanceado"
          overallBalanceStatus = 'surplus';
        } else if (availableOverall < -1000) {
          overallBalanceStatus = 'deficit';
        }

        const summary: MonthlySummary = {
          salary,
          totalFixedExpenses,
          dailyExpensesBudget: dailyExpensesConfig,
          totalDailySpent,
          availableAfterFixed,
          availableOverall,
          fixedExpensesPercentage,
          dailyBudgetPercentage,
          overallBalanceStatus
        };

        console.log('Resumen mensual calculado:', summary);
        return summary;
      }),
      catchError(error => {
        console.error('Error obteniendo resumen mensual:', error);
        
        // Propagar el error sin fallback
        return throwError(() => new Error(`Error cargando resumen mensual: ${error.message || 'Error de conexión'}`));
      })
    );
  }

  /**
   * Obtiene el color del estado del balance
   */
  getBalanceStatusColor(status: 'surplus' | 'deficit' | 'balanced'): string {
    switch (status) {
      case 'surplus': return 'var(--status-paid)';
      case 'deficit': return 'var(--status-overdue)';
      case 'balanced': return 'var(--status-due)';
      default: return 'var(--text-secondary)';
    }
  }

  /**
   * Obtiene el texto del estado del balance
   */
  getBalanceStatusText(status: 'surplus' | 'deficit' | 'balanced'): string {
    switch (status) {
      case 'surplus': return 'Superávit';
      case 'deficit': return 'Déficit';
      case 'balanced': return 'Balanceado';
      default: return 'Desconocido';
    }
  }

  /**
   * Obtiene el ícono del estado del balance
   */
  getBalanceStatusIcon(status: 'surplus' | 'deficit' | 'balanced'): string {
    switch (status) {
      case 'surplus': return 'trending_up';
      case 'deficit': return 'trending_down';
      case 'balanced': return 'trending_flat';
      default: return 'help';
    }
  }
}