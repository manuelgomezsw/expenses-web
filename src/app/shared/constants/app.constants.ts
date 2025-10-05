/**
 * Constantes de la aplicación
 * Centraliza valores que se usan en múltiples lugares
 */
export const APP_CONSTANTS = {
  
  /**
   * Formatos de fecha utilizados en la aplicación
   */
  DATE_FORMAT: {
    MONTH: 'YYYY-MM',
    FULL_DATE: 'YYYY-MM-DD',
    DISPLAY_DATE: 'DD/MM/YYYY'
  },

  /**
   * Patrones de validación
   */
  VALIDATION: {
    MONTH_REGEX: /^\d{4}-\d{2}$/,
    MIN_AMOUNT: 1,
    MAX_PAYMENT_DAY: 31,
    MIN_PAYMENT_DAY: 1,
    MIN_YEAR: 2020,
    MAX_YEAR: 2030
  },

  /**
   * Configuraciones de UI
   */
  UI: {
    DEBOUNCE_TIME: 300,
    ANIMATION_DURATION: 300,
    DIALOG_WIDTH: {
      SMALL: '400px',
      MEDIUM: '500px',
      LARGE: '700px',
      EXTRA_LARGE: '800px'
    },
    MOBILE_BREAKPOINT: 768
  },

  /**
   * Configuraciones de progreso y colores
   */
  PROGRESS: {
    WARNING_THRESHOLD: 80,
    DANGER_THRESHOLD: 100,
    ACCENT_THRESHOLD: 70
  },

  /**
   * Tipos de gastos
   */
  EXPENSE_TYPES: {
    FIXED: 'fixed' as const,
    HYBRID: 'hybrid' as const
  },

  /**
   * Estados de balance
   */
  BALANCE_STATUS: {
    SURPLUS: 'surplus' as const,
    DEFICIT: 'deficit' as const,
    BALANCED: 'balanced' as const
  },

  /**
   * Colores de progreso para Material Design
   */
  PROGRESS_COLORS: {
    PRIMARY: 'primary' as const,
    ACCENT: 'accent' as const,
    WARN: 'warn' as const
  },

  /**
   * Mensajes de error comunes
   */
  ERROR_MESSAGES: {
    NETWORK: 'No se pudo conectar al servidor',
    SERVER_ERROR: 'Error interno del servidor',
    CLIENT_ERROR: 'Error en la solicitud',
    CONNECTION_ERROR: 'Error de conexión',
    LOADING_ERROR: 'Error cargando datos',
    SAVE_ERROR: 'Error guardando datos',
    DELETE_ERROR: 'Error eliminando datos'
  },

  /**
   * Configuraciones de paginación y límites
   */
  LIMITS: {
    MAX_TRANSACTIONS_PER_PAGE: 50,
    MAX_EXPENSES_PER_POCKET: 100,
    BALANCE_TOLERANCE: 1000 // Para considerar "balanceado"
  }
} as const;

/**
 * Tipos derivados de las constantes para type safety
 */
export type ExpenseType = typeof APP_CONSTANTS.EXPENSE_TYPES[keyof typeof APP_CONSTANTS.EXPENSE_TYPES];
export type BalanceStatus = typeof APP_CONSTANTS.BALANCE_STATUS[keyof typeof APP_CONSTANTS.BALANCE_STATUS];
export type ProgressColor = typeof APP_CONSTANTS.PROGRESS_COLORS[keyof typeof APP_CONSTANTS.PROGRESS_COLORS];
