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
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';

// Pipes
import { CurrencyPipe } from '@angular/common';
import { CustomDatePipe } from '../pipes/custom-date/custom-date.pipe';

// Domain models
import { Salary } from '../domain/salary';
import { FixedExpense } from '../domain/fixed-expense';
import { DailyExpense } from '../domain/daily-expense';
import { DailyExpensesConfig } from '../domain/daily-expenses-config';

// Services
import { MockDataService } from '../services/mock-data.service';
import { NotificationService } from '../services/notification/notification.service';
import { ConfirmDialogComponent } from '../components/confirm-dialog/confirm-dialog.component';
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
    MatTooltipModule,
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
  dailyExpensesConfig: DailyExpensesConfig = { monthly_budget: 0, month: this.currentMonth };
  dailyExpenses: DailyExpense[] = [];
  
  // Computed properties
  totalFixedExpenses: number = 0;
  totalDailySpent: number = 0;
  dailyRemaining: number = 0;
  availableAfterFixed: number = 0;
  
  // Form properties
  newDailyExpense: DailyExpense = {
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0]
  };
  
  // Edit mode properties
  isEditingDaily: boolean = false;
  editingDailyId: number | null = null;
  
  // UI properties
  fixedExpensesByPocket: { [key: string]: FixedExpense[] } = {};

  constructor(
    private titleService: Title,
    private mockDataService: MockDataService,
    private notificationService: NotificationService,
    private dialog: MatDialog
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

    // Cargar configuración de gastos diarios
    this.mockDataService.getDailyExpensesConfig(this.currentMonth).subscribe({
      next: (config) => {
        this.dailyExpensesConfig = config;
        this.calculateTotals();
      },
      error: (error) => {
        console.error('Error loading daily expenses config:', error);
        this.notificationService.openSnackBar('Error cargando configuración de gastos diarios');
      }
    });

    // Cargar gastos diarios
    this.mockDataService.getDailyExpenses(this.currentMonth).subscribe({
      next: (expenses) => {
        this.dailyExpenses = expenses.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        this.calculateTotals();
      },
      error: (error) => {
        console.error('Error loading daily expenses:', error);
        this.notificationService.openSnackBar('Error cargando gastos diarios');
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
    this.totalDailySpent = this.dailyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    this.dailyRemaining = this.dailyExpensesConfig.monthly_budget - this.totalDailySpent;
    this.availableAfterFixed = this.salary.monthly_amount - this.totalFixedExpenses - this.dailyExpensesConfig.monthly_budget;
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

  // Métodos para gastos diarios
  addDailyExpense(): void {
    if (!this.newDailyExpense.description.trim() || this.newDailyExpense.amount <= 0) {
      this.notificationService.openSnackBar('Por favor completa todos los campos');
      return;
    }

    if (this.isEditingDaily) {
      this.updateDailyExpense();
    } else {
      this.createDailyExpense();
    }
  }

  private createDailyExpense(): void {
    this.mockDataService.addDailyExpense(this.newDailyExpense).subscribe({
      next: (expense) => {
        this.dailyExpenses.unshift(expense);
        this.calculateTotals();
        this.clearDailyForm();
        this.notificationService.openSnackBar('Gasto diario agregado');
      },
      error: (error) => {
        console.error('Error adding daily expense:', error);
        this.notificationService.openSnackBar('Error agregando gasto');
      }
    });
  }

  private updateDailyExpense(): void {
    if (!this.editingDailyId) return;

    const updatedExpense: DailyExpense = {
      ...this.newDailyExpense,
      id: this.editingDailyId
    };

    this.mockDataService.updateDailyExpense(updatedExpense).subscribe({
      next: (expense) => {
        const index = this.dailyExpenses.findIndex(e => e.id === this.editingDailyId);
        if (index !== -1) {
          this.dailyExpenses[index] = expense;
          this.dailyExpenses.sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
        }
        this.calculateTotals();
        this.clearDailyForm();
        this.notificationService.openSnackBar('Gasto actualizado correctamente');
      },
      error: (error) => {
        console.error('Error updating daily expense:', error);
        this.notificationService.openSnackBar('Error actualizando gasto');
      }
    });
  }

  editDailyExpense(expense: DailyExpense): void {
    this.isEditingDaily = true;
    this.editingDailyId = expense.id!;
    this.newDailyExpense = {
      description: expense.description,
      amount: expense.amount,
      date: expense.date
    };
  }

  deleteDailyExpense(expenseId: number): void {
    const expense = this.dailyExpenses.find(e => e.id === expenseId);
    if (!expense) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        message: `¿Estás seguro de que quieres eliminar el gasto "${expense.description}"?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.mockDataService.deleteDailyExpense(expenseId).subscribe({
          next: () => {
            this.dailyExpenses = this.dailyExpenses.filter(e => e.id !== expenseId);
            this.calculateTotals();
            this.notificationService.openSnackBar('Gasto eliminado correctamente');
          },
          error: (error) => {
            console.error('Error deleting daily expense:', error);
            this.notificationService.openSnackBar('Error eliminando gasto');
          }
        });
      }
    });
  }

  cancelEditDaily(): void {
    this.isEditingDaily = false;
    this.editingDailyId = null;
    this.clearDailyForm();
  }

  private clearDailyForm(): void {
    this.newDailyExpense = {
      description: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0]
    };
    this.isEditingDaily = false;
    this.editingDailyId = null;
  }

  getDailyProgressPercentage(): number {
    if (this.dailyExpensesConfig.monthly_budget === 0) return 0;
    return (this.totalDailySpent / this.dailyExpensesConfig.monthly_budget) * 100;
  }

  getDailyProgressColor(): string {
    const percentage = this.getDailyProgressPercentage();
    if (percentage >= 90) return 'warn';
    if (percentage >= 70) return 'accent';
    return 'primary';
  }
}