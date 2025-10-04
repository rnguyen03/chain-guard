import { Vulnerability, Application, Alert } from '../types';

/**
 * Alert Service for ChainGuardia
 * Handles creation, management, and notification of security alerts
 */

export interface AlertConfig {
  enableEmailNotifications: boolean;
  enableSlackNotifications: boolean;
  enableDashboardNotifications: boolean;
  criticalThreshold: number; // CVSS score threshold for critical alerts
  checkInterval: number; // Minutes between checks
}

export const defaultAlertConfig: AlertConfig = {
  enableEmailNotifications: false,
  enableSlackNotifications: false,
  enableDashboardNotifications: true,
  criticalThreshold: 7.0,
  checkInterval: 60
};

/**
 * Create alerts for new vulnerabilities affecting tracked applications
 */
export const createVulnerabilityAlerts = (
  vulnerabilities: Vulnerability[],
  applications: Application[]
): Alert[] => {
  const alerts: Alert[] = [];
  
  vulnerabilities.forEach(vuln => {
    if (vuln.affectedApps.length > 0) {
      const affectedAppNames = vuln.affectedApps
        .map(appId => applications.find(app => app.id === appId)?.name)
        .filter(Boolean)
        .join(', ');

      const alert: Alert = {
        id: `alert-${vuln.id}-${Date.now()}`,
        message: `New ${vuln.severity.toLowerCase()} vulnerability ${vuln.cveId} affects ${affectedAppNames}`,
        severity: vuln.severity,
        timestamp: new Date().toISOString(),
        vulnerabilityId: vuln.id,
        appIds: vuln.affectedApps,
        read: false
      };

      alerts.push(alert);
    }
  });

  return alerts;
};

/**
 * Filter alerts by severity and unread status
 */
export const filterAlerts = (
  alerts: Alert[],
  options: {
    severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    unreadOnly?: boolean;
    limit?: number;
  } = {}
): Alert[] => {
  let filtered = alerts;

  if (options.severity) {
    filtered = filtered.filter(alert => alert.severity === options.severity);
  }

  if (options.unreadOnly) {
    filtered = filtered.filter(alert => !alert.read);
  }

  if (options.limit) {
    filtered = filtered.slice(0, options.limit);
  }

  return filtered.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
};

/**
 * Mark alerts as read
 */
export const markAlertsAsRead = (alertIds: string[], alerts: Alert[]): Alert[] => {
  return alerts.map(alert => 
    alertIds.includes(alert.id) 
      ? { ...alert, read: true }
      : alert
  );
};

/**
 * Generate alert summary statistics
 */
export const getAlertStats = (alerts: Alert[]) => {
  const total = alerts.length;
  const unread = alerts.filter(alert => !alert.read).length;
  const critical = alerts.filter(alert => alert.severity === 'CRITICAL').length;
  const high = alerts.filter(alert => alert.severity === 'HIGH').length;
  const recent = alerts.filter(alert => {
    const alertTime = new Date(alert.timestamp);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return alertTime > oneDayAgo;
  }).length;

  return {
    total,
    unread,
    critical,
    high,
    recent
  };
};

/**
 * Format alert message for different notification channels
 */
export const formatAlertMessage = (
  alert: Alert,
  channel: 'dashboard' | 'email' | 'slack' = 'dashboard'
): string => {
  const severityEmoji = {
    CRITICAL: '🚨',
    HIGH: '⚠️',
    MEDIUM: '🔶',
    LOW: 'ℹ️'
  };

  const emoji = severityEmoji[alert.severity];
  
  switch (channel) {
    case 'email':
      return `
ChainGuardia Security Alert

${emoji} ${alert.severity} Severity Alert

${alert.message}

Timestamp: ${new Date(alert.timestamp).toLocaleString()}
Vulnerability ID: ${alert.vulnerabilityId}

Please review this alert in your ChainGuardia dashboard and take appropriate action.

---
ChainGuardia Security Monitoring
      `.trim();

    case 'slack':
      return `${emoji} *${alert.severity} Alert*: ${alert.message}`;

    case 'dashboard':
    default:
      return alert.message;
  }
};

/**
 * Check if alert should trigger notification based on configuration
 */
export const shouldTriggerNotification = (
  alert: Alert,
  config: AlertConfig
): boolean => {
  // Always notify for critical alerts
  if (alert.severity === 'CRITICAL') {
    return true;
  }

  // Check if severity meets threshold
  const severityThresholds = {
    HIGH: 7.0,
    MEDIUM: 4.0,
    LOW: 0.1
  };

  const threshold = severityThresholds[alert.severity] || 0;
  return threshold >= config.criticalThreshold;
};

/**
 * Simulate real-time alert generation (for demo purposes)
 */
export const simulateNewAlerts = (
  applications: Application[],
  existingAlerts: Alert[] = []
): Alert[] => {
  // Simulate new alerts based on mock scenarios
  const mockScenarios = [
    {
      severity: 'CRITICAL' as const,
      message: 'Critical authentication bypass vulnerability detected in Slack',
      appNames: ['Slack']
    },
    {
      severity: 'HIGH' as const,
      message: 'Remote code execution vulnerability found in Zoom Client',
      appNames: ['Zoom']
    },
    {
      severity: 'MEDIUM' as const,
      message: 'Cross-site scripting vulnerability in GitHub Enterprise',
      appNames: ['GitHub']
    }
  ];

  const newAlerts: Alert[] = [];
  
  // Randomly generate 1-2 new alerts
  const numAlerts = Math.floor(Math.random() * 2) + 1;
  
  for (let i = 0; i < numAlerts; i++) {
    const scenario = mockScenarios[Math.floor(Math.random() * mockScenarios.length)];
    const affectedApps = applications.filter(app => 
      scenario.appNames.some(name => 
        app.name.toLowerCase().includes(name.toLowerCase())
      )
    );

    if (affectedApps.length > 0) {
      const alert: Alert = {
        id: `alert-sim-${Date.now()}-${i}`,
        message: scenario.message,
        severity: scenario.severity,
        timestamp: new Date().toISOString(),
        vulnerabilityId: `sim-${Date.now()}-${i}`,
        appIds: affectedApps.map(app => app.id),
        read: false
      };

      newAlerts.push(alert);
    }
  }

  return [...existingAlerts, ...newAlerts];
};
