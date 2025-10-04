import React, { useState, useEffect } from 'react';
import { Alert } from '../types';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock,
  Filter,
  CheckCheck,
  Trash2
} from 'lucide-react';

interface AlertCenterProps {
  alerts: Alert[];
  onMarkAsRead: (alertIds: string[]) => void;
  onDeleteAlert: (alertId: string) => void;
}

export const AlertCenter: React.FC<AlertCenterProps> = ({
  alerts,
  onMarkAsRead,
  onDeleteAlert
}) => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'critical' | 'high'>('all');
  const [selectedAlerts, setSelectedAlerts] = useState<string[]>([]);

  const filteredAlerts = alerts.filter(alert => {
    switch (filter) {
      case 'unread':
        return !alert.read;
      case 'critical':
        return alert.severity === 'CRITICAL';
      case 'high':
        return alert.severity === 'HIGH';
      default:
        return true;
    }
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'text-red-700 bg-red-100 border-red-200';
      case 'HIGH':
        return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'MEDIUM':
        return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'LOW':
        return 'text-blue-700 bg-blue-100 border-blue-200';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <XCircle size={20} className="text-red-600" />;
      case 'HIGH':
        return <AlertTriangle size={20} className="text-orange-600" />;
      case 'MEDIUM':
        return <Clock size={20} className="text-yellow-600" />;
      case 'LOW':
        return <Bell size={20} className="text-blue-600" />;
      default:
        return <Bell size={20} className="text-gray-600" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - alertTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d ago`;
    }
  };

  const handleSelectAlert = (alertId: string) => {
    setSelectedAlerts(prev => 
      prev.includes(alertId) 
        ? prev.filter(id => id !== alertId)
        : [...prev, alertId]
    );
  };

  const handleSelectAll = () => {
    if (selectedAlerts.length === filteredAlerts.length) {
      setSelectedAlerts([]);
    } else {
      setSelectedAlerts(filteredAlerts.map(alert => alert.id));
    }
  };

  const handleMarkAsRead = () => {
    if (selectedAlerts.length > 0) {
      onMarkAsRead(selectedAlerts);
      setSelectedAlerts([]);
    }
  };

  const handleDeleteSelected = () => {
    selectedAlerts.forEach(alertId => onDeleteAlert(alertId));
    setSelectedAlerts([]);
  };

  const unreadCount = alerts.filter(alert => !alert.read).length;
  const criticalCount = alerts.filter(alert => alert.severity === 'CRITICAL').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Bell size={24} className="text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Security Alerts</h2>
            {unreadCount > 0 && (
              <span className="px-2 py-1 bg-red-100 text-red-800 text-sm rounded-full font-semibold">
                {unreadCount} unread
              </span>
            )}
          </div>
          
          {criticalCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
              <XCircle size={20} className="text-red-600" />
              <span className="text-red-800 font-semibold">
                {criticalCount} Critical Alert{criticalCount > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-600" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Alerts</option>
              <option value="unread">Unread Only</option>
              <option value="critical">Critical Only</option>
              <option value="high">High Priority</option>
            </select>
          </div>

          {selectedAlerts.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleMarkAsRead}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <CheckCircle size={16} />
                Mark as Read ({selectedAlerts.length})
              </button>
              <button
                onClick={handleDeleteSelected}
                className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                <Trash2 size={16} />
                Delete ({selectedAlerts.length})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Bell size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No alerts found</h3>
            <p className="text-gray-500">
              {filter === 'all' 
                ? "You're all caught up! No security alerts at this time."
                : `No ${filter} alerts found.`
              }
            </p>
          </div>
        ) : (
          <>
            {/* Select All */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedAlerts.length === filteredAlerts.length && filteredAlerts.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Select all {filteredAlerts.length} alert{filteredAlerts.length > 1 ? 's' : ''}
                </span>
              </label>
            </div>

            {/* Alert Items */}
            {filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`bg-white rounded-lg shadow-md border-l-4 ${
                  alert.read ? 'opacity-75' : ''
                } ${
                  alert.severity === 'CRITICAL' ? 'border-red-500' :
                  alert.severity === 'HIGH' ? 'border-orange-500' :
                  alert.severity === 'MEDIUM' ? 'border-yellow-500' :
                  'border-blue-500'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={selectedAlerts.includes(alert.id)}
                      onChange={() => handleSelectAlert(alert.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getSeverityIcon(alert.severity)}
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(alert.severity)}`}>
                          {alert.severity}
                        </span>
                        {!alert.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                        <span className="text-sm text-gray-500">
                          {formatTimeAgo(alert.timestamp)}
                        </span>
                      </div>
                      
                      <p className="text-gray-900 font-medium mb-2">
                        {alert.message}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Vulnerability: {alert.vulnerabilityId}</span>
                        <span>Apps affected: {alert.appIds.length}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!alert.read && (
                        <button
                          onClick={() => onMarkAsRead([alert.id])}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Mark as read"
                        >
                          <CheckCheck size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => onDeleteAlert(alert.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete alert"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};
