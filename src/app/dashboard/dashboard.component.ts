import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatFabButton } from '@angular/material/button';

// Pipes
import { CurrencyPipe } from '@angular/common';
import { CustomDatePipe } from '../pipes/custom-date/custom-date.pipe';

// Domain models
import { Salary } from '../domain/salary';
import { FixedExpense } from '../domain/fixed-expense';
import { MecatoExpense } from '../domain/mecato-expense';
import { MecatoConfig } from '../domain/mecato-config';

// Services
import { MockDataService } from '../services/mock-data.service';
import { NotificationService } from '../services/notification/notification.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatProgressBarModule,
    MatDividerModule,
    MatChipsModule,
    MatFabButton,
    CurrencyPipe,
    CustomDatePipe
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  
  // Data properties
  currentMonth: string = '2024-01';
  salary: Salary = { monthly_amount: 0, month: this.currentMonth };
  fixedExpenses: FixedExpense[] = [];
  mecatoConfig: MecatoConfig = { monthly_budget: 0, month: this.currentMonth };
  mecatoExpenses: MecatoExpense[] = [];
  
  // Computed properties
  totalFixedExpenses: number = 0;
  totalMecatoSpent: number = 0;
  mecatoRemaining: number = 0;
  availableAfterFixed: number = 0;
  
  // Form properties
  newMecatoExpense: MecatoExpense = {
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0]
  };
  
  // UI properties
  fixedExpensesByPocket: { [key: string]: FixedExpense[] } = {};

  constructor(
    private titleService: Title,
    private mockDataService: MockDataService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle(environment.titleWebSite + ' - Dashboard Financiero');
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    // Cargar salario
    this.mockDataService.getSalary(this.currentMonth).subscribe({
      next: (salary) => {
        this.salary = salary;
        this.calculateTotals();
      },
      error: (error) => {
        console.error('Error loading salary:', error);
        this.notificationService.openSnackBar('Error cargando salario');
      }
    });

    // Cargar gastos fijos
    this.mockDataService.getFixedExpenses(this.currentMonth).subscribe({
      next: (expenses) => {
        this.fixedExpenses = expenses;
        this.groupFixedExpensesByPocket();
        this.calculateTotals();
      },
      error: (error) => {
        console.error('Error loading fixed expenses:', error);
        this.notificationService.openSnackBar('Error cargando gastos fijos');
      }
    });

    // Cargar configuración de mecato
    this.mockDataService.getMecatoConfig(this.currentMonth).subscribe({
      next: (config) => {
        this.mecatoConfig = config;
        this.calculateTotals();
      },
      error: (error) => {
        console.error('Error loading mecato config:', error);
        this.notificationService.openSnackBar('Error cargando configuración de mecato');
      }
    });

    // Cargar gastos de mecato
    this.mockDataService.getMecatoExpenses(this.currentMonth).subscribe({
      next: (expenses) => {
        this.mecatoExpenses = expenses.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        this.calculateTotals();
      },
      error: (error) => {
        console.error('Error loading mecato expenses:', error);
        this.notificationService.openSnackBar('Error cargando gastos de mecato');
      }
    });
  }

  private groupFixedExpensesByPocket(): void {
    this.fixedExpensesByPocket = this.fixedExpenses.reduce((groups, expense) => {
      const pocket = expense.pocket_name;
      if (!groups[pocket]) {
        groups[pocket] = [];
      }
      groups[pocket].push(expense);
      return groups;
    }, {} as { [key: string]: FixedExpense[] });
  }

  private calculateTotals(): void {
    this.totalFixedExpenses = this.fixedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    this.totalMecatoSpent = this.mecatoExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    this.mecatoRemaining = this.mecatoConfig.monthly_budget - this.totalMecatoSpent;
    this.availableAfterFixed = this.salary.monthly_amount - this.totalFixedExpenses - this.mecatoConfig.monthly_budget;
  }

  // Métodos para gastos fijos
  toggleFixedExpensePaid(expense: FixedExpense): void {
    expense.is_paid = !expense.is_paid;
    expense.paid_date = expense.is_paid ? new Date().toISOString().split('T')[0] : undefined;
    
    this.mockDataService.markFixedExpenseAsPaid(expense.id!).subscribe({
      next: () => {
        const status = expense.is_paid ? 'pagado' : 'marcado como pendiente';
        this.notificationService.openSnackBar(`${expense.concept_name} ${status}`);
      },
      error: (error) => {
        console.error('Error updating expense:', error);
        expense.is_paid = !expense.is_paid; // Revertir cambio
        this.notificationService.openSnackBar('Error actualizando gasto');
      }
    });
  }

  getExpenseStatus(expense: FixedExpense): 'paid' | 'due' | 'overdue' {
    if (expense.is_paid) return 'paid';
    
    const today = new Date();
    const paymentDate = new Date(today.getFullYear(), today.getMonth(), expense.payment_day);
    
    if (paymentDate < today) return 'overdue';
    return 'due';
  }

  getPocketKeys(): string[] {
    return Object.keys(this.fixedExpensesByPocket);
  }

  // Métodos para mecato
  addMecatoExpense(): void {
    if (!this.newMecatoExpense.description.trim() || this.newMecatoExpense.amount <= 0) {
      this.notificationService.openSnackBar('Por favor completa todos los campos');
      return;
    }

    this.mockDataService.addMecatoExpense(this.newMecatoExpense).subscribe({
      next: (expense) => {
        this.mecatoExpenses.unshift(expense);
        this.calculateTotals();
        this.clearMecatoForm();
        this.notificationService.openSnackBar('Gasto de mecato agregado');
      },
      error: (error) => {
        console.error('Error adding mecato expense:', error);
        this.notificationService.openSnackBar('Error agregando gasto');
      }
    });
  }

  private clearMecatoForm(): void {
    this.newMecatoExpense = {
      description: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0]
    };
  }

  getMecatoProgressPercentage(): number {
    if (this.mecatoConfig.monthly_budget === 0) return 0;
    return (this.totalMecatoSpent / this.mecatoConfig.monthly_budget) * 100;
  }

  getMecatoProgressColor(): string {
    const percentage = this.getMecatoProgressPercentage();
    if (percentage >= 90) return 'warn';
    if (percentage >= 70) return 'accent';
    return 'primary';
  }
}