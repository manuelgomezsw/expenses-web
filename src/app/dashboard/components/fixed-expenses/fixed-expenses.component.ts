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

// Pipes
import { CurrencyPipe } from '@angular/common';

// Services and Models
import { FixedExpensesService, FixedExpensesByPocket } from '../../services/fixed-expenses.service';
import { FixedExpense } from '../../../domain/fixed-expense';
import { NotificationService } from '../../../services/notification/notification.service';

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
    private notificationService: NotificationService
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
}