import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

// Pipes
import { CurrencyPipe } from '@angular/common';

// Services and Models
import { FixedExpensesService, FixedExpensesByPocket } from '../../services/fixed-expenses.service';
import { FixedExpense, HybridTransaction, CreateHybridTransactionBackendRequest } from '../../../domain/fixed-expense';
import { NotificationService } from '../../../services/notification/notification.service';
import { HybridTransactionsService } from '../../../configuration/services/hybrid-transactions.service';
import { HybridTransactionsModalComponent, HybridTransactionsData, HybridTransactionsResult } from '../../../configuration/components/hybrid-transactions-modal/hybrid-transactions-modal.component';

// New Modals
import { AddHybridTransactionModalComponent, AddHybridTransactionData, AddHybridTransactionResult } from '../../../shared/components/add-hybrid-transaction-modal/add-hybrid-transaction-modal.component';
import { ViewHybridTransactionsModalComponent, ViewHybridTransactionsData, ViewHybridTransactionsResult } from '../../../shared/components/view-hybrid-transactions-modal/view-hybrid-transactions-modal.component';

@Component({
  selector: 'app-fixed-expenses',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatCheckboxModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatDialogModule,
    CurrencyPipe
  ],
  templateUrl: './fixed-expenses.component.html',
  styleUrl: './fixed-expenses.component.css'
})
export class FixedExpensesComponent implements OnInit, OnDestroy, OnChanges {
  @Input() currentMonth: string = '2024-01';
  @Input() isCollapsed: boolean = false;
  @Output() toggleCollapse = new EventEmitter<void>();
  @Output() expenseStatusChanged = new EventEmitter<void>();

  expenses: FixedExpense[] = [];
  filteredExpenses: FixedExpense[] = [];
  expensesByPocket: FixedExpensesByPocket = {};
  isLoading = false;
  error: string | null = null;
  
  // Filtro actual
  currentFilter: 'all' | 'paid' | 'pending' = 'all';
  
  // Opciones de filtro
  filterOptions: Array<{value: 'all' | 'paid' | 'pending', label: string}> = [
    { value: 'all', label: 'Todos' },
    { value: 'paid', label: 'Pagados' },
    { value: 'pending', label: 'Pendientes' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private fixedExpensesService: FixedExpensesService,
    private notificationService: NotificationService,
    private hybridTransactionsService: HybridTransactionsService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadFixedExpenses();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentMonth'] && !changes['currentMonth'].firstChange) {
      this.loadFixedExpenses();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carga los gastos fijos del mes
   */
  private loadFixedExpenses(): void {
    this.isLoading = true;
    this.error = null;

    this.fixedExpensesService.getFixedExpenses(this.currentMonth)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (expenses) => {
          this.expenses = expenses;
          this.applyFilter();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading fixed expenses:', error);
          this.error = 'Error cargando gastos fijos';
          this.isLoading = false;
          this.notificationService.openSnackBar('Error cargando gastos fijos');
        }
      });
  }

  /**
   * Recarga los gastos fijos
   */
  refreshExpenses(): void {
    this.loadFixedExpenses();
  }

  /**
   * Toggle del estado de pago de un gasto fijo
   */
  togglePaymentStatus(expense: FixedExpense): void {
    const newStatus = !expense.is_paid;
    
    this.fixedExpensesService.togglePaymentStatus(expense.id!, newStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Actualizar el estado local
          expense.is_paid = newStatus;
          expense.paid_date = newStatus ? new Date().toISOString().split('T')[0] : undefined;
          
          // Reagrupar por bolsillos con filtro aplicado
          this.applyFilter();
          
          // Emitir evento para notificar al componente padre
          this.expenseStatusChanged.emit(); // Notify parent
          
          const status = newStatus ? 'pagado' : 'marcado como pendiente';
          this.notificationService.openSnackBar(`${expense.concept_name} ${status}`);
        },
        error: (error) => {
          console.error('Error updating expense:', error);
          this.notificationService.openSnackBar('Error actualizando gasto');
        }
      });
  }

  /**
   * Obtiene el estado de un gasto
   */
  getExpenseStatus(expense: FixedExpense): 'paid' | 'due' | 'overdue' {
    return this.fixedExpensesService.getExpenseStatus(expense);
  }

  /**
   * Obtiene las claves de los bolsillos
   */
  getPocketKeys(): string[] {
    return Object.keys(this.expensesByPocket);
  }

  /**
   * Calcula el total de gastos de un bolsillo
   */
  getPocketTotal(pocketName: string): number {
    const pocketExpenses = this.expensesByPocket[pocketName] || [];
    return this.fixedExpensesService.calculateTotal(pocketExpenses);
  }

  /**
   * Calcula cuántos gastos están pagados en un bolsillo
   */
  getPocketPaidCount(pocketName: string): number {
    const pocketExpenses = this.expensesByPocket[pocketName] || [];
    return pocketExpenses.filter(expense => expense.is_paid).length;
  }

  /**
   * Calcula el total general de gastos fijos
   */
  getTotalFixedExpenses(): number {
    return this.fixedExpensesService.calculateTotal(this.expenses);
  }

  /**
   * Calcula cuántos gastos están pagados en total
   */
  getTotalPaidCount(): number {
    return this.expenses.filter(expense => expense.is_paid).length;
  }

  /**
   * Obtiene el porcentaje de gastos pagados
   */
  getPaidPercentage(): number {
    if (this.expenses.length === 0) return 0;
    return (this.getTotalPaidCount() / this.expenses.length) * 100;
  }

  onToggleCollapse(): void {
    this.toggleCollapse.emit();
  }

  /**
   * Aplica el filtro actual a los gastos
   */
  private applyFilter(): void {
    this.filteredExpenses = this.fixedExpensesService.filterExpensesByStatus(this.expenses, this.currentFilter);
    this.expensesByPocket = this.fixedExpensesService.groupExpensesByPocket(this.filteredExpenses);
  }

  /**
   * Cambia el filtro actual
   */
  setFilter(filter: string): void {
    this.currentFilter = filter as 'all' | 'paid' | 'pending';
    this.applyFilter();
  }

  /**
   * Obtiene el conteo de gastos por filtro
   */
  getFilterCount(filter: string): number {
    const filterType = filter as 'all' | 'paid' | 'pending';
    if (filterType === 'all') {
      return this.expenses.length;
    } else if (filterType === 'paid') {
      return this.expenses.filter(expense => expense.is_paid).length;
    } else {
      return this.expenses.filter(expense => !expense.is_paid).length;
    }
  }

  /**
   * Verifica si un filtro está activo
   */
  isFilterActive(filter: string): boolean {
    return this.currentFilter === filter;
  }

  /**
   * Calcula el total de los gastos filtrados
   */
  getFilteredTotal(): number {
    return this.fixedExpensesService.calculateTotal(this.filteredExpenses);
  }

  // ========================================
  // MÉTODOS PARA GASTOS HÍBRIDOS
  // ========================================

  /**
   * Verifica si un gasto es híbrido
   */
  isHybridExpense(expense: FixedExpense): boolean {
    return expense.expense_type === 'hybrid';
  }

  /**
   * Calcula el porcentaje de progreso para gastos híbridos
   */
  getProgressPercentage(expense: FixedExpense): number {
    if (!expense.budget_limit || expense.budget_limit === 0) return 0;
    const spent = expense.current_spent || 0;
    return Math.min((spent / expense.budget_limit) * 100, 100);
  }

  /**
   * Obtiene el color de la barra de progreso según el porcentaje usado
   */
  getProgressColor(expense: FixedExpense): string {
    const percentage = this.getProgressPercentage(expense);
    if (percentage < 80) return 'primary';
    if (percentage < 95) return 'accent';
    return 'warn';
  }

  /**
   * Obtiene el estado visual del gasto híbrido
   */
  getHybridStatus(expense: FixedExpense): string {
    const percentage = this.getProgressPercentage(expense);
    if (percentage === 0) return 'unused';
    if (percentage < 80) return 'under-budget';
    if (percentage < 95) return 'near-limit';
    return 'over-budget';
  }

  /**
   * Obtiene el número de transacciones de un gasto híbrido
   */
  getTransactionCount(expense: FixedExpense): number {
    return expense.transactions?.length || 0;
  }

  /**
   * Abre el modal para ver transacciones híbridas
   */
  openHybridTransactionsModal(expense: FixedExpense): void {
    if (!expense.id) {
      console.error('No se puede abrir modal: expense.id es undefined');
      return;
    }

    if (expense.expense_type !== 'hybrid') {
      this.notificationService.openSnackBar('Este gasto no es híbrido');
      return;
    }

    const dialogData: ViewHybridTransactionsData = {
      expense: expense
    };

    const dialogRef = this.dialog.open(ViewHybridTransactionsModalComponent, {
      width: '600px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: dialogData,
      disableClose: false,
      hasBackdrop: true
    });

    dialogRef.afterClosed().subscribe((result: ViewHybridTransactionsResult | undefined) => {
      if (result && result.action === 'delete') {
        this.deleteHybridTransaction(expense, result.transactionId);
      }
    });
  }

  /**
   * Abre modal compacto para agregar transacción rápida
   */
  openQuickTransactionModal(expense: FixedExpense): void {
    if (!expense.id) {
      console.error('No se puede abrir modal: expense.id es undefined');
      return;
    }

    if (expense.expense_type !== 'hybrid') {
      this.notificationService.openSnackBar('Este gasto no es híbrido');
      return;
    }

    const remainingBudget = this.getRemainingBudget(expense);
    if (remainingBudget <= 0) {
      this.notificationService.openSnackBar('No hay presupuesto disponible para nuevas transacciones');
      return;
    }

    const dialogData: AddHybridTransactionData = {
      expenseName: expense.concept_name,
      remainingBudget: remainingBudget
    };

    const dialogRef = this.dialog.open(AddHybridTransactionModalComponent, {
      width: '500px',
      maxWidth: '95vw',
      data: dialogData,
      disableClose: false,
      hasBackdrop: true
    });

    dialogRef.afterClosed().subscribe((result: AddHybridTransactionResult | undefined) => {
      if (result && result.amount !== null && result.amount > 0) {
        const request: CreateHybridTransactionBackendRequest = {
          amount: result.amount,
          description: result.description,
          transaction_date: result.transaction_date
        };
        this.addHybridTransaction(expense, request);
      }
    });
  }

  /**
   * Obtiene el texto del estado del presupuesto
   */
  getBudgetStatusText(expense: FixedExpense): string {
    const percentage = this.getProgressPercentage(expense);
    const transactionCount = this.getTransactionCount(expense);
    
    if (percentage === 0) {
      return 'Sin transacciones';
    } else if (percentage < 80) {
      return `${percentage.toFixed(0)}% usado - ${transactionCount} transacciones`;
    } else if (percentage < 95) {
      return `${percentage.toFixed(0)}% usado - Cerca del límite`;
    } else {
      return `${percentage.toFixed(0)}% usado - Sobre presupuesto`;
    }
  }

  /**
   * Obtiene el monto disponible restante
   */
  getRemainingBudget(expense: FixedExpense): number {
    const budgetLimit = expense.budget_limit || 0;
    const currentSpent = expense.current_spent || 0;
    return Math.max(budgetLimit - currentSpent, 0);
  }

  // ========================================
  // MÉTODOS PARA TRANSACCIONES HÍBRIDAS
  // ========================================


  /**
   * Agrega una nueva transacción híbrida
   */
  private addHybridTransaction(expense: FixedExpense, request: CreateHybridTransactionBackendRequest): void {
    if (!expense.id) {
      console.error('No se puede crear transacción: expense.id es undefined');
      return;
    }
    
    this.hybridTransactionsService.createTransaction(expense.id, request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (newTransaction) => {
          this.notificationService.openSnackBar('Transacción agregada correctamente');
          
          // Recargar la lista completa de gastos para obtener datos actualizados del backend
          // Esto asegura que todos los datos estén sincronizados
          this.loadFixedExpenses();
        },
        error: (error) => {
          console.error('Error adding hybrid transaction:', error);
          this.notificationService.openSnackBar('Error agregando transacción. Intenta de nuevo.');
        }
      });
  }

  /**
   * Elimina una transacción híbrida
   */
  private deleteHybridTransaction(expense: FixedExpense, transactionId: number): void {
    if (!expense.id) {
      console.error('No se puede eliminar transacción: expense.id es undefined');
      return;
    }
    
    this.hybridTransactionsService.deleteTransaction(expense.id, transactionId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.openSnackBar('Transacción eliminada correctamente');
          
          // Recargar la lista completa de gastos para obtener datos actualizados del backend
          // Esto asegura que todos los datos estén sincronizados
          this.loadFixedExpenses();
        },
        error: (error) => {
          console.error('Error deleting hybrid transaction:', error);
          this.notificationService.openSnackBar('Error eliminando transacción. Intenta de nuevo.');
        }
      });
  }
}