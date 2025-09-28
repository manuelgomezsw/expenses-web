import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Salary } from '../../domain/salary';
import { FixedExpense } from '../../domain/fixed-expense';
import { DailyExpensesConfig } from '../../domain/daily-expenses-config';
import { MockDataService } from '../../services/mock-data.service';

export interface MonthlySummary {
  salary: Salary;
  totalFixedExpenses: number;
  mecatoBudget: DailyExpensesConfig;
  totalMecatoSpent: number;
  availableAfterFixed: number;
  availableOverall: number;
  fixedExpensesPercentage: number;
  mecatoBudgetPercentage: number;
  overallBalanceStatus: 'surplus' | 'deficit' | 'balanced';
}

@Injectable({
  providedIn: 'root'
})
export class SummaryService {

  constructor(private mockDataService: MockDataService) { }

  getMonthlySummary(month: string): Observable<MonthlySummary> {
    return new Observable(observer => {
      this.mockDataService.getSalary(month).subscribe(salary => {
        this.mockDataService.getFixedExpenses(month).subscribe(fixedExpenses => {
          this.mockDataService.getDailyExpensesConfig(month).subscribe(mecatoConfig => {
            this.mockDataService.getDailyExpenses(month).subscribe(mecatoExpenses => {

              const totalFixedExpenses = fixedExpenses
                .filter(e => !e.is_paid) // Only count unpaid fixed expenses for available calculation
                .reduce((sum, expense) => sum + expense.amount, 0);

              const totalMecatoSpent = mecatoExpenses.reduce((sum, expense) => sum + expense.amount, 0);

              const availableAfterFixed = salary.monthly_amount - totalFixedExpenses;
              const availableOverall = availableAfterFixed - (mecatoConfig.monthly_budget || 0);

              const fixedExpensesPercentage = salary.monthly_amount > 0
                ? (totalFixedExpenses / salary.monthly_amount) * 100
                : 0;

              const mecatoBudgetPercentage = salary.monthly_amount > 0
                ? ((mecatoConfig.monthly_budget || 0) / salary.monthly_amount) * 100
                : 0;

              let overallBalanceStatus: 'surplus' | 'deficit' | 'balanced' = 'balanced';
              if (availableOverall > 0) {
                overallBalanceStatus = 'surplus';
              } else if (availableOverall < 0) {
                overallBalanceStatus = 'deficit';
              }

              observer.next({
                salary,
                totalFixedExpenses,
                mecatoBudget: mecatoConfig,
                totalMecatoSpent,
                availableAfterFixed,
                availableOverall,
                fixedExpensesPercentage,
                mecatoBudgetPercentage,
                overallBalanceStatus
              });
              observer.complete();
            });
          });
        });
      });
    });
  }
}