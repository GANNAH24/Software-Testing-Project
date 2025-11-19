import { useState, useEffect } from 'react';
import { Activity, CheckCircle, AlertTriangle, Server, Database, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';

// Converted from TSX: removed SystemHealthProps interface and type annotations
export function SystemHealth({ navigate, user }) {
  const MOCK_HEALTH_DATA = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: 'production',
    version: '1.0.0',
    services: [
      { name: 'API Server', status: 'healthy', uptime: '99.9%', responseTime: '45ms' },
      { name: 'Database', status: 'healthy', uptime: '99.8%', responseTime: '12ms' },
      { name: 'Authentication', status: 'healthy', uptime: '100%', responseTime: '8ms' },
      { name: 'File Storage', status: 'warning', uptime: '98.5%', responseTime: '120ms' }
    ]
  };

  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState(new Date());

  useEffect(() => { fetchHealthData(); }, []);

  const fetchHealthData = () => {
    setLoading(true);
    setTimeout(() => {
      setHealthData(MOCK_HEALTH_DATA);
      setLastChecked(new Date());
      setLoading(false);
    }, 1000);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'error': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default: return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-gray-900 mb-6">System Health</h1>
          <div className="space-y-6">
            <Card><CardContent className="p-6"><Skeleton className="h-8 w-32 mb-4" /><Skeleton className="h-4 w-48" /></CardContent></Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i}><CardContent className="p-6"><Skeleton className="h-6 w-24 mb-2" /><Skeleton className="h-4 w-32" /></CardContent></Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-gray-900 mb-2">System Health</h1>
            <p className="text-sm text-gray-600">Last checked: {lastChecked.toLocaleTimeString()}</p>
          </div>
          <Button onClick={fetchHealthData} variant="outline">Refresh Status</Button>
        </div>

        <Card className="mb-6"><CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${healthData?.status === 'healthy' ? 'bg-green-100' : 'bg-yellow-100'}`}>{getStatusIcon(healthData?.status || 'healthy')}</div>
              <div>
                <h2 className="text-gray-900 mb-1">Overall System Status</h2>
                <p className={`capitalize ${healthData?.status === 'healthy' ? 'text-green-600' : 'text-yellow-600'}`}>{healthData?.status}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Environment</div>
              <div className="text-gray-900 capitalize">{healthData?.environment}</div>
            </div>
          </div>
        </CardContent></Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card><CardContent className="p-6"><div className="flex items-start justify-between"><div><p className="text-sm text-gray-600 mb-2">Version</p><p className="text-2xl text-gray-900">{healthData?.version}</p></div><div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center"><Server className="w-6 h-6 text-blue-600" /></div></div></CardContent></Card>
          <Card><CardContent className="p-6"><div className="flex items-start justify-between"><div><p className="text-sm text-gray-600 mb-2">Environment</p><p className="text-2xl text-gray-900 capitalize">{healthData?.environment}</p></div><div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center"><Globe className="w-6 h-6 text-purple-600" /></div></div></CardContent></Card>
          <Card><CardContent className="p-6"><div className="flex items-start justify-between"><div><p className="text-sm text-gray-600 mb-2">Last Check</p><p className="text-lg text-gray-900">{lastChecked.toLocaleTimeString()}</p></div><div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center"><Activity className="w-6 h-6 text-green-600" /></div></div></CardContent></Card>
        </div>

        <Card><CardHeader><CardTitle>Services Status</CardTitle></CardHeader><CardContent>
          <div className="space-y-4">
            {healthData?.services.map((service, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-4">
                  {getStatusIcon(service.status)}
                  <div>
                    <div className="text-gray-900">{service.name}</div>
                    <div className={`text-sm capitalize ${service.status === 'healthy' ? 'text-green-600' : 'text-yellow-600'}`}>{service.status}</div>
                  </div>
                </div>
                <div className="flex gap-8 text-sm">
                  <div className="text-right"><div className="text-gray-600">Uptime</div><div className="text-gray-900">{service.uptime}</div></div>
                  <div className="text-right"><div className="text-gray-600">Response Time</div><div className="text-gray-900">{service.responseTime}</div></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent></Card>

        <Card className="mt-6"><CardHeader><CardTitle>System Information</CardTitle></CardHeader><CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><h3 className="text-gray-900 mb-2">Health Check Endpoint</h3><code className="text-sm bg-gray-100 px-3 py-2 rounded block">GET /health</code></div>
            <div><h3 className="text-gray-900 mb-2">Timestamp</h3><p className="text-gray-600">{new Date(healthData?.timestamp).toLocaleString()}</p></div>
          </div>
        </CardContent></Card>
      </div>
    </div>
  );
}
