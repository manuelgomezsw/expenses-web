import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';

import { FixedExpense, HybridTransaction, CreateHybridTransactionRequest, CreateHybridTransactionBackendRequest } from '../../../domain/fixed-expense';

export interface HybridTransactionsData {
  expense: FixedExpense;
}

export interface HybridTransactionsResult {
  action: 'add' | 'edit' | 'delete';
  transaction?: HybridTransaction;
  transactionRequest?: CreateHybridTransactionBackendRequest;
  transactionId?: number;
}

@Component({
  selector: 'app-hybrid-transactions-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule
  ],
  templateUrl: './hybrid-transactions-modal.component.html',
  styleUrl: './hybrid-transactions-modal.component.css'
})
export class HybridTransactionsModalComponent implements OnInit {

  expenseName: string = '';
  budgetLimit: number = 0;
  currentSpent: number = 0;
  transactions: HybridTransaction[] = [];

  newTransaction: CreateHybridTransactionRequest = {
    fixed_expense_id: 0,
    amount: 0,
    description: '',
    transaction_date: new Date().toISOString().split('T')[0]
  };

  constructor(
    public dialogRef: MatDialogRef<HybridTransactionsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: HybridTransactionsData
  ) {}

  ngOnInit(): void {
    if (this.data.expense) {
      this.expenseName = this.data.expense.concept_name;
      this.budgetLimit = this.data.expense.budget_limit || 0;
      this.currentSpent = this.data.expense.current_spent || 0;
      this.transactions = this.data.expense.transactions || [];
      this.newTransaction.fixed_expense_id = this.data.expense.id || 0;
    }
  }

  get remainingBudget(): number {
    return this.budgetLimit - this.currentSpent;
  }

  getProgressPercentage(): number {
    if (this.budgetLimit === 0) return 0;
    return Math.min((this.currentSpent / this.budgetLimit) * 100, 100);
  }

  getProgressColor(): 'primary' | 'accent' | 'warn' {
    const percentage = this.getProgressPercentage();
    if (percentage >= 100) return 'warn';
    if (percentage >= 80) return 'accent';
    return 'primary';
  }

  isExceeded(): boolean {
    return this.remainingBudget < 0;
  }

  isTransactionFormValid(): boolean {
    return !!(
      this.newTransaction.amount > 0 &&
      this.newTransaction.amount <= this.remainingBudget &&
      this.newTransaction.transaction_date &&
      this.data.expense.id // Validar que el expense tenga ID
    );
  }

  addTransaction(): void {
    if (this.isTransactionFormValid()) {
      // Remover fixed_expense_id del request según nuevos cambios del backend
      const { fixed_expense_id, ...transactionRequest } = this.newTransaction;
      
      const result: HybridTransactionsResult = {
        action: 'add',
        transactionRequest: transactionRequest
      };
      this.dialogRef.close(result);
    }
  }

  editTransaction(transaction: HybridTransaction): void {
    // Para simplificar, por ahora solo permitimos eliminar
    // En una implementación completa, abriríamos otro modal de edición
  }

  deleteTransaction(transaction: HybridTransaction): void {
    if (transaction.id) {
      const result: HybridTransactionsResult = {
        action: 'delete',
        transactionId: transaction.id
      };
      this.dialogRef.close(result);
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }

  trackByTransactionId(index: number, transaction: HybridTransaction): number {
    return transaction.id || index;
  }
}