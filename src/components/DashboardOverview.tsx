import { DashboardStats, Vulnerability } from '../types';
import { Shield, AlertTriangle, Activity, TrendingUp, Clock, CheckCircle, XCircle, Bell } from 'lucide-react';

interface DashboardOverviewProps {
  stats: DashboardStats;
  vulnerabilities: Vulnerability[];
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  stats,
  vulnerabilities
}) => {
  const recentVulnerabilities = vulnerabilities
    .sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime())
    .slice(0, 5);

  const criticalVulns = vulnerabilities.filter(v => v.severity === 'CRITICAL');
  const highVulns = vulnerabilities.filter(v => v.severity === 'HIGH');
  const acknowledgedVulns = vulnerabilities.filter(v => v.status === 'acknowledged');
  const mitigatedVulns = vulnerabilities.filter(v => v.status === 'mitigated');
  
  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    subtitle
  }: {
    title: string;
    value: number;
    icon: React.ElementType;
    color: string;
    subtitle?: string;
  }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="p-3 rounded-full" style={{ backgroundColor: `${color}20` }}>
          <Icon size={24} style={{ color }} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-8 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Shield size={32} />
          <h1 className="text-3xl font-bold">ChainGuardia Security Dashboard</h1>
        </div>
        <p className="text-blue-100">
          Proactive Supply Chain Attack Monitoring
        </p>
        <p className="text-sm text-blue-200 mt-2">
          "Know when your apps turn against you."
        </p>
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2 text-sm">
            <Bell size={16} />
            <span>Real-time monitoring active</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock size={16} />
            <span>Last scan: {getTimeAgo(new Date().toISOString())}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Applications"
          value={stats.totalApps}
          icon={Activity}
          color="#3b82f6"
          subtitle="Under monitoring"
        />
        <StatCard
          title="Total Vulnerabilities"
          value={stats.totalVulnerabilities}
          icon={AlertTriangle}
          color="#ef4444"
          subtitle="Active threats"
        />
        <StatCard
          title="Critical Issues"
          value={stats.criticalVulnerabilities}
          icon={AlertTriangle}
          color="#dc2626"
          subtitle="Immediate action required"
        />
        <StatCard
          title="High Priority"
          value={stats.highVulnerabilities}
          icon={TrendingUp}
          color="#f59e0b"
          subtitle="Review soon"
        />
      </div>

      {/* Security Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severity Breakdown */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Vulnerability Severity Distribution
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-3xl font-bold text-red-700">
                {stats.criticalVulnerabilities}
              </p>
              <p className="text-sm text-red-600 font-medium mt-1">Critical</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-3xl font-bold text-orange-700">
                {stats.highVulnerabilities}
              </p>
              <p className="text-sm text-orange-600 font-medium mt-1">High</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-3xl font-bold text-yellow-700">
                {stats.mediumVulnerabilities}
              </p>
              <p className="text-sm text-yellow-600 font-medium mt-1">Medium</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-3xl font-bold text-blue-700">
                {stats.lowVulnerabilities}
              </p>
              <p className="text-sm text-blue-600 font-medium mt-1">Low</p>
            </div>
          </div>
        </div>

        {/* Response Status */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Response Status
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <XCircle size={20} className="text-red-500" />
                <span className="font-medium text-gray-700">Active Vulnerabilities</span>
              </div>
              <span className="text-2xl font-bold text-red-600">
                {vulnerabilities.filter(v => v.status === 'active').length}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock size={20} className="text-yellow-500" />
                <span className="font-medium text-gray-700">Acknowledged</span>
              </div>
              <span className="text-2xl font-bold text-yellow-600">
                {acknowledgedVulns.length}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle size={20} className="text-green-500" />
                <span className="font-medium text-gray-700">Mitigated</span>
              </div>
              <span className="text-2xl font-bold text-green-600">
                {mitigatedVulns.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Alerts */}
      {criticalVulns.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle size={24} className="text-red-600" />
            <h3 className="text-xl font-semibold text-red-800">
              Critical Security Alerts
            </h3>
          </div>
          <div className="space-y-3">
            {criticalVulns.slice(0, 3).map((vuln) => (
              <div key={vuln.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <div>
                    <p className="font-semibold text-red-800">{vuln.cveId}</p>
                    <p className="text-sm text-red-600 line-clamp-1">
                      {vuln.description}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-red-600 font-medium">
                  {getTimeAgo(vuln.publishedDate)}
                </span>
              </div>
            ))}
          </div>
          {criticalVulns.length > 3 && (
            <p className="text-sm text-red-600 mt-3">
              +{criticalVulns.length - 3} more critical vulnerabilities
            </p>
          )}
        </div>
      )}

      {/* Recent Vulnerabilities */}
      {recentVulnerabilities.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Recent Vulnerabilities
          </h3>
          <div className="space-y-3">
            {recentVulnerabilities.map((vuln) => {
              const getSeverityColor = (severity: string) => {
                switch (severity) {
                  case 'CRITICAL':
                    return 'text-red-700 bg-red-100';
                  case 'HIGH':
                    return 'text-orange-700 bg-orange-100';
                  case 'MEDIUM':
                    return 'text-yellow-700 bg-yellow-100';
                  case 'LOW':
                    return 'text-blue-700 bg-blue-100';
                  default:
                    return 'text-gray-700 bg-gray-100';
                }
              };

              return (
                <div
                  key={vuln.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <AlertTriangle
                      size={20}
                      className={vuln.severity === 'CRITICAL' || vuln.severity === 'HIGH' ? 'text-red-500' : 'text-yellow-500'}
                    />
                    <div>
                      <p className="font-medium text-gray-900">{vuln.cveId}</p>
                      <p className="text-sm text-gray-600 line-clamp-1">
                        {vuln.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Published {getTimeAgo(vuln.publishedDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getSeverityColor(
                        vuln.severity
                      )}`}
                    >
                      {vuln.severity}
                    </span>
                    {vuln.affectedApps.length > 0 && (
                      <span className="text-xs text-blue-600 font-medium">
                        {vuln.affectedApps.length} app{vuln.affectedApps.length > 1 ? 's' : ''} affected
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          Recommended Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-blue-800">Immediate Response</h4>
            <ul className="space-y-2 text-sm text-blue-700">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                Review {criticalVulns.length} critical vulnerabilities
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                Assess {highVulns.length} high-priority threats
              </li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-blue-800">Ongoing Security</h4>
            <ul className="space-y-2 text-sm text-blue-700">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                Update affected applications to secure versions
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                Configure real-time vulnerability alerts
              </li>
            </ul>
          </div>
        </div>
        {criticalVulns.length > 0 && (
          <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 font-medium">
              ⚠️ {criticalVulns.length} critical vulnerability{criticalVulns.length > 1 ? 'ies' : ''} require immediate attention
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
