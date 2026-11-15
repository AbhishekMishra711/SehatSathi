import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { AdminMetrics, AuditLog } from '../types';
import { 
  Users, 
  ShieldAlert, 
  Trash2, 
  Unlock, 
  Play, 
  FileText, 
  Activity, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [activeTab, setActiveTab] = useState<'metrics' | 'users' | 'audit' | 'actions'>('metrics');
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [metricsRes, usersRes, logsRes] = await Promise.all([
        apiRequest<{ success: boolean; metrics: AdminMetrics }>('/api/admin/metrics'),
        apiRequest<{ success: boolean; users: any[] }>('/api/admin/users'),
        apiRequest<{ success: boolean; logs: AuditLog[] }>('/api/admin/audit-logs')
      ]);

      if (metricsRes.success) setMetrics(metricsRes.metrics);
      if (usersRes.success) setUsers(usersRes.users);
      if (logsRes.success) setLogs(logsRes.logs);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleUnlockUser = async (userId: string) => {
    try {
      const res = await apiRequest<{ success: boolean; message: string }>(`/api/admin/user/${userId}/unlock`, {
        method: 'POST'
      });
      if (res.success) {
        setActionMessage('User lockout cleared successfully.');
        setTimeout(() => setActionMessage(null), 3000);
        loadAdminData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to unlock user');
    }
  };

  const handleDeleteUser = async (userId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete user ${name}? This action cannot be undone.`)) return;

    try {
      const res = await apiRequest<{ success: boolean; message: string }>(`/api/admin/user/${userId}`, {
        method: 'DELETE'
      });
      if (res.success) {
        setActionMessage('User removed successfully.');
        setTimeout(() => setActionMessage(null), 3000);
        loadAdminData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete user');
    }
  };

  const handleTriggerEscalation = async () => {
    try {
      const res = await apiRequest<{ success: boolean; summary: any }>('/api/admin/trigger-escalation', {
        method: 'POST'
      });
      if (res.success) {
        setActionMessage(`Escalation cron executed: ${res.summary.evaluatedCount} doses checked, ${res.summary.remindedElder} elders reminded, ${res.summary.alertedCaretaker} caretakers alerted.`);
        loadAdminData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to trigger escalation');
    }
  };

  if (isLoading && !metrics) {
    return (
      <div style={{ maxWidth: '900px', margin: '40px auto', textAlign: 'center', padding: '20px' }}>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>Loading Master Admin Console...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '28px 20px' }}>
      {/* Header bar */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <span style={{
            fontSize: '0.78rem',
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: '12px',
            backgroundColor: 'var(--c-deep-ocean)',
            color: '#FFFFFF'
          }}>
            Master Admin Console
          </span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--c-deep-ocean)', marginTop: '4px', margin: 0 }}>
            Platform System Overview
          </h1>
        </div>

        <button
          onClick={loadAdminData}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: '6px',
            border: '1px solid var(--border-strong)',
            backgroundColor: '#FFFFFF',
            fontWeight: 600,
            fontSize: '0.9rem'
          }}
        >
          <RefreshCw size={16} />
          <span>Refresh Data</span>
        </button>
      </div>

      {actionMessage && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          backgroundColor: 'var(--status-taken-bg)',
          color: 'var(--status-taken)',
          fontWeight: 700,
          marginBottom: '20px'
        }}>
          {actionMessage}
        </div>
      )}

      {/* Metrics Row */}
      {metrics && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '28px'
        }}>
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '18px' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total registered seniors</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--c-deep-ocean)', marginTop: '4px' }}>
              {metrics.totalElders}
            </div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '18px' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Caregivers & Family</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--c-ocean-teal)', marginTop: '4px' }}>
              {metrics.totalCaregivers}
            </div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '18px' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Prescriptions</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--c-teal)', marginTop: '4px' }}>
              {metrics.totalMeds}
            </div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '18px' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Overall Adherence</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--status-taken)', marginTop: '4px' }}>
              {metrics.adherenceRate}%
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '2px solid var(--border-color)', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('metrics')}
          style={{
            padding: '12px 20px',
            fontSize: '0.95rem',
            fontWeight: 700,
            color: activeTab === 'metrics' ? 'var(--c-deep-ocean)' : 'var(--text-muted)',
            borderBottom: activeTab === 'metrics' ? '3px solid var(--c-deep-ocean)' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Activity size={18} />
          <span>Macro Actions</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          style={{
            padding: '12px 20px',
            fontSize: '0.95rem',
            fontWeight: 700,
            color: activeTab === 'users' ? 'var(--c-deep-ocean)' : 'var(--text-muted)',
            borderBottom: activeTab === 'users' ? '3px solid var(--c-deep-ocean)' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Users size={18} />
          <span>Users Directory ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          style={{
            padding: '12px 20px',
            fontSize: '0.95rem',
            fontWeight: 700,
            color: activeTab === 'audit' ? 'var(--c-deep-ocean)' : 'var(--text-muted)',
            borderBottom: activeTab === 'audit' ? '3px solid var(--c-deep-ocean)' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <FileText size={18} />
          <span>System Audit Logs</span>
        </button>
      </div>

      {/* Tab 1: Macro Actions */}
      {activeTab === 'metrics' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--c-deep-ocean)', marginBottom: '8px' }}>
              Manual Escalation Cron Trigger
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
              Executes the escalation check across all active elder profiles immediately, checking due doses, 
              evaluating grace periods, and dispatching notification emails.
            </p>
            <button
              onClick={handleTriggerEscalation}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                borderRadius: '6px',
                backgroundColor: 'var(--c-deep-ocean)',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.95rem'
              }}
            >
              <Play size={18} />
              <span>Trigger Escalation Tick Now</span>
            </button>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--c-deep-ocean)', marginBottom: '8px' }}>
              Security & Environment Status
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', marginTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Database Provider:</span>
                <span style={{ fontWeight: 700 }}>Neon PostgreSQL 18 (Active)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Email Engine:</span>
                <span style={{ fontWeight: 700 }}>Resend API (Active)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>AI Assistant Engine:</span>
                <span style={{ fontWeight: 700 }}>Google Gemini 2.5/Flash-Lite (Active)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Users Directory */}
      {activeTab === 'users' && (
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '10px', overflowX: 'auto' }}>
          {users.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No registered users yet.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.92rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--primary-light)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--c-deep-ocean)' }}>Name & Email</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--c-deep-ocean)' }}>Role</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--c-deep-ocean)' }}>Link Code</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--c-deep-ocean)' }}>Lockout Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--c-deep-ocean)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{u.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.email}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        backgroundColor: u.role === 'ELDER' ? 'var(--c-lime)' : u.role === 'ADMIN' ? 'var(--c-deep-ocean)' : 'var(--c-mint)',
                        color: u.role === 'ADMIN' ? '#FFFFFF' : 'var(--c-deep-ocean)'
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--c-ocean-teal)' }}>
                      {u.linkCode || '-'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {u.isLocked ? (
                        <span style={{ color: 'var(--status-missed)', fontWeight: 700 }}>
                          Locked ({u.failedAttempts} fails)
                        </span>
                      ) : (
                        <span style={{ color: 'var(--status-taken)', fontWeight: 600 }}>Active</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        {u.isLocked && (
                          <button
                            onClick={() => handleUnlockUser(u.id)}
                            style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid var(--c-ocean-teal)', color: 'var(--c-ocean-teal)', fontWeight: 600, fontSize: '0.8rem' }}
                            title="Clear lockout"
                          >
                            <Unlock size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid var(--status-missed)', color: 'var(--status-missed)', fontWeight: 600, fontSize: '0.8rem' }}
                          title="Delete user"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab 3: System Audit Logs */}
      {activeTab === 'audit' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {logs.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
              No audit records logged yet.
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '14px 18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', backgroundColor: 'var(--bg-subtle)', color: 'var(--text-muted)' }}>
                      {log.action}
                    </span>
                    <span style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      {log.details}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Actor: {log.performedBy.name} ({log.performedBy.role})
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

