import { Component, Input, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';

import { DailyExpense } from '../../../domain/daily-expense';
import { DailyExpensesConfig } from '../../../domain/daily-expenses-config';
import { DailyExpensesService, DailyExpensesSummary } from '../../services/daily-expenses.service';
import { NotificationService } from '../../../services/notification/notification.service';
import { ConfirmDialogComponent } from '../../../components/confirm-dialog/confirm-dialog.component';
import { CustomDatePipe } from '../../../pipes/custom-date/custom-date.pipe';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-daily-expenses',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    MatTooltipModule,
    CurrencyPipe,
    CustomDatePipe
  ],
  templateUrl: './daily-expenses.component.html',
  styleUrl: './daily-expenses.component.css'
})
export class DailyExpensesComponent implements OnInit, OnDestroy {
  @Input() currentMonth: string = '2024-01'; // Format YYYY-MM
  @Output() expenseAdded = new EventEmitter<void>();
  @Output() expenseUpdated = new EventEmitter<void>();
  @Output() expenseDeleted = new EventEmitter<void>();

  summary: DailyExpensesSummary | null = null;
  isLoading: boolean = true;
  hasError: boolean = false;
  private destroy$ = new Subject<void>();

  // Form properties
  newDailyExpense: DailyExpense = {
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0]
  };

  // Edit mode properties
  isEditingDaily: boolean = false;
  editingDailyId: number | null = null;

  constructor(
    private dailyExpensesService: DailyExpensesService,
    private notificationService: NotificationService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadDailyExpensesSummary();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDailyExpensesSummary(): void {
    this.isLoading = true;
    this.hasError = false;
    this.dailyExpensesService.getDailyExpensesSummary(this.currentMonth)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.summary = data;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading daily expenses summary:', err);
          this.hasError = true;
          this.isLoading = false;
        }
      });
  }

  // Form methods
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
    this.dailyExpensesService.addDailyExpense(this.newDailyExpense)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (expense) => {
          // Add to local list and re-sort
          if (this.summary) {
            this.summary.expenses.unshift(expense);
            this.summary.expenses.sort((a, b) => 
              new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            // Recalculate totals
            this.summary.totalSpent = this.dailyExpensesService.calculateTotalSpent(this.summary.expenses);
            this.summary.remaining = this.summary.config.monthly_budget - this.summary.totalSpent;
            this.summary.progressPercentage = this.summary.config.monthly_budget > 0 
              ? (this.summary.totalSpent / this.summary.config.monthly_budget) * 100 
              : 0;
          }
          this.clearDailyForm();
          this.notificationService.openSnackBar('Gasto diario agregado');
          this.expenseAdded.emit(); // Notify parent
        },
        error: (error) => {
          console.error('Error adding daily expense:', error);
          this.notificationService.openSnackBar('Error agregando gasto');
        }
      });
  }

  private updateDailyExpense(): void {
    if (!this.editingDailyId || !this.summary) return;

    const updatedExpense: DailyExpense = {
      ...this.newDailyExpense,
      id: this.editingDailyId
    };

    this.dailyExpensesService.updateDailyExpense(updatedExpense)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (expense) => {
          if (this.summary) {
            const index = this.summary.expenses.findIndex(e => e.id === this.editingDailyId);
            if (index !== -1) {
              this.summary.expenses[index] = expense;
              this.summary.expenses.sort((a, b) => 
                new Date(b.date).getTime() - new Date(a.date).getTime()
              );
              // Recalculate totals
              this.summary.totalSpent = this.dailyExpensesService.calculateTotalSpent(this.summary.expenses);
              this.summary.remaining = this.summary.config.monthly_budget - this.summary.totalSpent;
              this.summary.progressPercentage = this.summary.config.monthly_budget > 0 
                ? (this.summary.totalSpent / this.summary.config.monthly_budget) * 100 
                : 0;
            }
          }
          this.clearDailyForm();
          this.notificationService.openSnackBar('Gasto actualizado correctamente');
          this.expenseUpdated.emit(); // Notify parent
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
    if (!this.summary) return;
    
    const expense = this.summary.expenses.find(e => e.id === expenseId);
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
        this.dailyExpensesService.deleteDailyExpense(expenseId)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              if (this.summary) {
                this.summary.expenses = this.summary.expenses.filter(e => e.id !== expenseId);
                // Recalculate totals
                this.summary.totalSpent = this.dailyExpensesService.calculateTotalSpent(this.summary.expenses);
                this.summary.remaining = this.summary.config.monthly_budget - this.summary.totalSpent;
                this.summary.progressPercentage = this.summary.config.monthly_budget > 0 
                  ? (this.summary.totalSpent / this.summary.config.monthly_budget) * 100 
                  : 0;
              }
              this.notificationService.openSnackBar('Gasto eliminado correctamente');
              this.expenseDeleted.emit(); // Notify parent
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

  // Utility methods
  getProgressColor(): 'primary' | 'accent' | 'warn' {
    if (!this.summary) return 'primary';
    return this.dailyExpensesService.getProgressColor(this.summary.progressPercentage);
  }

  getMonthlyName(month: string): string {
    const [year, monthNum] = month.split('-').map(Number);
    const date = new Date(year, monthNum - 1, 1);
    return date.toLocaleString('es-CO', { month: 'long', year: 'numeric' });
  }
}