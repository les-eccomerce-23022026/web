/**
 * Chart Colors - Design System Constants
 * Cores consistentes para gráficos do dashboard
 */
export const CHART_COLORS = {
  // Primary green (brand color)
  PRIMARY: 'rgb(46, 139, 87)',
  PRIMARY_ALPHA: 'rgba(46, 139, 87, 0.2)',
  PRIMARY_DARK: 'rgb(15, 76, 58)',
  PRIMARY_DARK_ALPHA: 'rgba(15, 76, 58, 0.5)',
  PRIMARY_DARK_OPAQUE: 'rgba(15, 76, 58, 0.8)',

  // Secondary (tan/beige)
  SECONDARY: 'rgb(210, 180, 140)',
  SECONDARY_ALPHA: 'rgba(210, 180, 140, 0.5)',
  SECONDARY_OPAQUE: 'rgba(210, 180, 140, 0.8)',

  // Status colors for doughnut chart
  STATUS_SUCCESS: 'rgba(15, 76, 58, 0.8)',      // Entregues
  STATUS_SUCCESS_LIGHT: 'rgba(46, 139, 87, 0.8)', // Em Trânsito
  STATUS_WARNING: 'rgba(210, 180, 140, 0.8)',    // Preparando
  STATUS_ALERT: 'rgba(255, 165, 0, 0.8)',        // Pendentes
  STATUS_ERROR: 'rgba(201, 48, 44, 0.8)',        // Devoluções
} as const;
