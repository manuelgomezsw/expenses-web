import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

// Components
import { FixedExpensesComponent } from './components/fixed-expenses/fixed-expenses.component';
import { DailyExpensesComponent } from './components/daily-expenses/daily-expenses.component';
import { MonthSelectorComponent } from '../shared/components/month-selector/month-selector.component';

// Utilities
import { DateUtils } from '../shared/utils/date.utils';

import { environment } from '../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MonthSelectorComponent,
    FixedExpensesComponent,
    DailyExpensesComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  
  // Current month for all components
  currentMonth: string = DateUtils.getCurrentMonth();
  
  // Collapsible components state
  isFixedExpensesCollapsed: boolean = false;
  isDailyExpensesCollapsed: boolean = false;
  
  // Mobile detection
  isMobile: boolean = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private titleService: Title,
    private route: ActivatedRoute,
    private router: Router,
    private breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle(environment.titleWebSite + ' - Dashboard Financiero');
    
    // Detect mobile and set initial collapse state
    this.breakpointObserver.observe([Breakpoints.Handset])
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.isMobile = result.matches;
        this.setInitialCollapseState();
      });
    
    // Listen to query parameter changes for month
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const monthParam = params['month'];
        if (monthParam && DateUtils.isValidMonth(monthParam)) {
          this.currentMonth = monthParam;
        } else {
          // If no valid month param, redirect to current month
          this.currentMonth = DateUtils.getCurrentMonth();
          this.updateUrlWithMonth(this.currentMonth);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Handle events from child components to refresh summary when needed
   */
  onFixedExpenseStatusChanged(): void {
    // The monthly summary component will automatically refresh
    // when fixed expenses change since it uses its own service
    console.log('Fixed expense status changed - summary will auto-refresh');
  }

  onDailyExpenseAdded(): void {
    // The monthly summary component will automatically refresh
    // when daily expenses change since it uses its own service
    console.log('Daily expense added - summary will auto-refresh');
  }

  onDailyExpenseUpdated(): void {
    console.log('Daily expense updated - summary will auto-refresh');
  }

  onDailyExpenseDeleted(): void {
    console.log('Daily expense deleted - summary will auto-refresh');
  }

  /**
   * Handle month change from MonthSelector
   */
  onMonthChanged(newMonth: string): void {
    this.updateUrlWithMonth(newMonth);
  }

  // Métodos de fecha movidos a DateUtils para evitar duplicación

  /**
   * Update URL with month parameter
   */
  private updateUrlWithMonth(month: string): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { month },
      queryParamsHandling: 'merge'
    });
  }

  // Collapsible methods
  setInitialCollapseState(): void {
    if (this.isMobile) {
      // On mobile: keep monthly-summary expanded, collapse others
      this.isFixedExpensesCollapsed = true;
      this.isDailyExpensesCollapsed = false; // Keep daily expenses expanded for quick access
    } else {
      // On desktop: keep all expanded
      this.isFixedExpensesCollapsed = false;
      this.isDailyExpensesCollapsed = false;
    }
  }


  toggleFixedExpenses(): void {
    this.isFixedExpensesCollapsed = !this.isFixedExpensesCollapsed;
  }

  toggleDailyExpenses(): void {
    this.isDailyExpensesCollapsed = !this.isDailyExpensesCollapsed;
  }
}