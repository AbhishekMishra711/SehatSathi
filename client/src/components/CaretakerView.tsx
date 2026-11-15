import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { User, Medication, Appointment, AuditLog, DoseSchedule } from '../types';
import { 
  Activity, 
  Pill, 
  Calendar, 
  FileText, 
  Sparkles, 
  Plus, 
  AlertTriangle, 
  Clock, 
  Link as LinkIcon
} from 'lucide-react';

interface CaretakerViewProps {
  currentUser: User;
}

export const CaretakerView: React.FC<CaretakerViewProps> = ({ currentUser }) => {
  const [elderProfileId, setElderProfileId] = useState<string | null>(null);
  const [overviewData, setOverviewData] = useState<any>(null);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'medications' | 'appointments' | 'audit'>('overview');
  
  // Modals & form state
  const [showAddMedModal, setShowAddMedModal] = useState(false);
  const [showAddAptModal, setShowAddAptModal] = useState(false);
  const [prescriptionInput, setPrescriptionInput] = useState('');
  const [isAiParsing, setIsAiParsing] = useState(false);
  const [parsedAiResult, setParsedAiResult] = useState<any>(null);
  const [manualMedForm, setManualMedForm] = useState({
    name: '',
    dosage: '',
    instructions: '',
    frequency: 'TWICE_DAILY',
    timeSlots: '08:00, 20:00'
  });
  const [aptForm, setAptForm] = useState({
    doctorName: '',
    specialty: '',
    location: '',
    scheduledAt: '',
    notes: ''
  });
  const [simulating, setSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);

  // Link elder state
  const [connectCode, setConnectCode] = useState('');
  const [connectRelation, setConnectRelation] = useState('Son / Daughter');
  const [connecting, setConnecting] = useState(false);

  const initElder = async () => {
    try {
      const meRes = await apiRequest<{ success: boolean; user: any }>('/api/auth/me');
      if (meRes.success && meRes.user.linkedElders?.length > 0) {
        setElderProfileId(meRes.user.linkedElders[0].elderProfileId);
      }
    } catch (err) {
      console.error('Failed to load user links', err);
    }
  };

  useEffect(() => {
    initElder();
  }, [currentUser]);

  const loadAllData = async (profileId: string) => {
    try {
      const [overviewRes, medsRes, aptsRes, auditRes] = await Promise.all([
        apiRequest<any>(`/api/caretaker/overview/${profileId}`),
        apiRequest<any>(`/api/caretaker/medications/${profileId}`),
        apiRequest<any>(`/api/caretaker/appointments/${profileId}`),
        apiRequest<any>(`/api/caretaker/audit-trail/${profileId}`)
      ]);

      if (overviewRes.success) setOverviewData(overviewRes.data);
      if (medsRes.success) setMedications(medsRes.medications);
      if (aptsRes.success) setAppointments(aptsRes.appointments);
      if (auditRes.success) setAuditLogs(auditRes.logs);
    } catch (err) {
      console.error('Failed to load caretaker data', err);
    }
  };

  useEffect(() => {
    if (elderProfileId) {
      loadAllData(elderProfileId);
    }
  }, [elderProfileId]);

  const handleParseAi = async () => {
    if (!prescriptionInput.trim()) return;
    setIsAiParsing(true);
    try {
      const res = await apiRequest<{ success: boolean; parsed: any }>('/api/caretaker/parse-prescription', {
        method: 'POST',
        body: JSON.stringify({ prescriptionText: prescriptionInput })
      });
      if (res.success) {
        setParsedAiResult(res.parsed);
        setManualMedForm({
          name: res.parsed.name,
          dosage: res.parsed.dosage,
          instructions: res.parsed.instructions,
          frequency: res.parsed.frequency,
          timeSlots: res.parsed.timeSlots.join(', ')
        });
      }
    } catch (err: any) {
      alert(err.message || 'AI parsing failed');
    } finally {
      setIsAiParsing(false);
    }
  };

  const handleSaveMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!elderProfileId) return;

    try {
      const slotsArray = manualMedForm.timeSlots
        .split(',')
        .map(s => s.trim())
        .filter(s => /^([01]\d|2[0-3]):([0-5]\d)$/.test(s));

      if (slotsArray.length === 0) {
        alert('Please specify at least one valid time in HH:MM 24-hour format (e.g. 08:30).');
        return;
      }

      const res = await apiRequest<any>(`/api/caretaker/medications/${elderProfileId}`, {
        method: 'POST',
        body: JSON.stringify({
          name: manualMedForm.name,
          dosage: manualMedForm.dosage,
          instructions: manualMedForm.instructions,
          frequency: manualMedForm.frequency,
          timeSlots: slotsArray
        })
      });

      if (res.success) {
        setShowAddMedModal(false);
        setPrescriptionInput('');
        setParsedAiResult(null);
        setManualMedForm({
          name: '',
          dosage: '',
          instructions: '',
          frequency: 'TWICE_DAILY',
          timeSlots: '08:00, 20:00'
        });
        loadAllData(elderProfileId);
      }
    } catch (err: any) {
      alert(err.message || 'Could not save medication.');
    }
  };

  const handleSaveAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!elderProfileId) return;

    try {
      const res = await apiRequest<any>(`/api/caretaker/appointments/${elderProfileId}`, {
        method: 'POST',
        body: JSON.stringify(aptForm)
      });

      if (res.success) {
        setShowAddAptModal(false);
        setAptForm({ doctorName: '', specialty: '', location: '', scheduledAt: '', notes: '' });
        loadAllData(elderProfileId);
      }
    } catch (err: any) {
      alert(err.message || 'Could not schedule appointment.');
    }
  };

  const handleTriggerSimulation = async () => {
    if (!elderProfileId) return;
    setSimulating(true);
    setSimulationResult(null);

    try {
      const res = await apiRequest<any>(`/api/caretaker/simulate-escalation/${elderProfileId}`, {
        method: 'POST'
      });

      if (res.success) {
        setSimulationResult(res);
        loadAllData(elderProfileId);
      }
    } catch (err: any) {
      alert(err.message || 'Simulation failed.');
    } finally {
      setSimulating(false);
    }
  };

  // If no elder linked yet, show "Connect to elder" card
  if (!elderProfileId) {
    return (
      <div style={{ maxWidth: '520px', margin: '48px auto', padding: '20px' }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '32px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--c-deep-ocean)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto'
          }}>
            <LinkIcon size={24} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--c-deep-ocean)', marginBottom: '8px' }}>
            Connect to an elder
          </h2>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.5 }}>
            Enter the 6-digit link code shown on the elder's phone screen to view medications and receive alerts.
          </p>

          <form onSubmit={async (e) => {
            e.preventDefault();
            setConnecting(true);
            try {
              // Register caregiver link via linking code
              const me = await apiRequest<{ success: boolean; user: any }>('/api/auth/me');
              const res = await apiRequest<{ success: boolean; message: string }>('/api/caretaker/link-patient', {
                method: 'POST',
                body: JSON.stringify({ linkCode: connectCode, relationship: connectRelation })
              }).catch(() => null);

              // Reload links
              await initElder();
            } catch (err: any) {
              alert(err.message || 'Could not connect with elder link code.');
            } finally {
              setConnecting(false);
            }
          }}>
            <div style={{ marginBottom: '14px', textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                Elder link code
              </label>
              <input
                type="text"
                required
                value={connectCode}
                onChange={(e) => setConnectCode(e.target.value.toUpperCase())}
                placeholder="e.g. EL-8492"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-strong)', textTransform: 'uppercase', fontWeight: 700 }}
              />
            </div>

            <div style={{ marginBottom: '20px', textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                Your relationship
              </label>
              <input
                type="text"
                required
                value={connectRelation}
                onChange={(e) => setConnectRelation(e.target.value)}
                placeholder="e.g. Son, Daughter, Nurse"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-strong)' }}
              />
            </div>

            <button
              type="submit"
              disabled={connecting}
              style={{
                width: '100%',
                padding: '12px 0',
                borderRadius: '6px',
                backgroundColor: 'var(--c-deep-ocean)',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '1rem'
              }}
            >
              {connecting ? 'Connecting...' : 'Connect to elder'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!overviewData) {
    return (
      <div style={{ maxWidth: '900px', margin: '40px auto', textAlign: 'center', padding: '20px' }}>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>Loading care dashboard...</p>
      </div>
    );
  }

  const { elder, stats, permissions } = overviewData;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 20px' }}>
      {/* Top Elder Context Bar */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--c-deep-ocean)', margin: 0 }}>
              {elder.name}
            </h1>
            <span style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '12px',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--c-deep-ocean)'
            }}>
              Blood Group: {elder.bloodGroup || 'Not specified'}
            </span>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Medical Notes: {elder.medicalNotes}
          </p>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '2px', fontWeight: 600 }}>
            Emergency Contact: {elder.emergencyPhone || 'Not specified'}
          </div>
        </div>

        {/* Live Simulation Button for Testing */}
        <div style={{ textAlign: 'right' }}>
          <button
            onClick={handleTriggerSimulation}
            disabled={simulating}
            style={{
              padding: '10px 18px',
              borderRadius: '6px',
              backgroundColor: 'var(--status-missed-bg)',
              color: 'var(--status-missed)',
              border: '1px solid var(--status-missed)',
              fontWeight: 700,
              fontSize: '0.92rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <AlertTriangle size={18} />
            <span>{simulating ? 'Simulating...' : 'Simulate Missed Dose Escalation'}</span>
          </button>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
            Tests real-time escalation chain & email alerts
          </span>
        </div>
      </div>

      {/* Simulation Feedback Alert */}
      {simulationResult && (
        <div style={{
          backgroundColor: '#FFFBEB',
          border: '1px solid #F59E0B',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <h4 style={{ color: '#B45309', fontWeight: 700, margin: '0 0 6px 0', fontSize: '1rem' }}>
            Escalation Chain Executed Live
          </h4>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', margin: 0 }}>
            Simulated missed dose for <strong>{simulationResult.targetDose?.medication}</strong>.
            Alerted Caretaker via email and recorded in Audit Log.
          </p>
        </div>
      )}

      {/* Adherence Overview Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '28px'
      }}>
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '18px' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>7-Day Adherence</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--c-deep-ocean)', marginTop: '4px' }}>
            {stats.adherenceRate}%
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '18px' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Doses Taken on Time</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--status-taken)', marginTop: '4px' }}>
            {stats.takenCount}
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '18px' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Missed / Escalated</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--status-missed)', marginTop: '4px' }}>
            {stats.missedCount}
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '18px' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Pending Today</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--status-due)', marginTop: '4px' }}>
            {stats.pendingCount}
          </div>
        </div>
      </div>

      {/* Dashboard Nav Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '2px solid var(--border-color)',
        marginBottom: '24px'
      }}>
        <button
          onClick={() => setActiveTab('overview')}
          style={{
            padding: '12px 20px',
            fontSize: '0.95rem',
            fontWeight: 700,
            color: activeTab === 'overview' ? 'var(--c-deep-ocean)' : 'var(--text-muted)',
            borderBottom: activeTab === 'overview' ? '3px solid var(--c-deep-ocean)' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Activity size={18} />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('medications')}
          style={{
            padding: '12px 20px',
            fontSize: '0.95rem',
            fontWeight: 700,
            color: activeTab === 'medications' ? 'var(--c-deep-ocean)' : 'var(--text-muted)',
            borderBottom: activeTab === 'medications' ? '3px solid var(--c-deep-ocean)' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Pill size={18} />
          <span>Medications ({medications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('appointments')}
          style={{
            padding: '12px 20px',
            fontSize: '0.95rem',
            fontWeight: 700,
            color: activeTab === 'appointments' ? 'var(--c-deep-ocean)' : 'var(--text-muted)',
            borderBottom: activeTab === 'appointments' ? '3px solid var(--c-deep-ocean)' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Calendar size={18} />
          <span>Doctor Appointments</span>
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
          <span>Audit Log</span>
        </button>
      </div>

      {/* Tab 1: Overview Tab */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {/* Recent Doses */}
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>Recent Doses</h3>
            {overviewData.recentDoses.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No recent doses logged yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {overviewData.recentDoses.map((dose: DoseSchedule) => (
                  <div
                    key={dose.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{dose.medication.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {new Date(dose.scheduledFor).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(dose.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    <span style={{
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      backgroundColor: dose.status === 'TAKEN' ? 'var(--status-taken-bg)' : dose.status === 'MISSED' ? 'var(--status-missed-bg)' : 'var(--status-due-bg)',
                      color: dose.status === 'TAKEN' ? 'var(--status-taken)' : dose.status === 'MISSED' ? 'var(--status-missed)' : 'var(--status-due)'
                    }}>
                      {dose.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Doctor Visits */}
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Upcoming Doctor Visits</h3>
              {permissions.canEditAppointments && (
                <button
                  onClick={() => setShowAddAptModal(true)}
                  style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--c-ocean-teal)' }}
                >
                  + Add Visit
                </button>
              )}
            </div>

            {overviewData.upcomingAppointments.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No upcoming doctor appointments scheduled.</p>
            ) : (
              overviewData.upcomingAppointments.map((apt: Appointment) => (
                <div
                  key={apt.id}
                  style={{
                    padding: '12px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    marginBottom: '10px'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{apt.doctorName}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--c-ocean-teal)', fontWeight: 600 }}>
                    {new Date(apt.scheduledAt).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} at {new Date(apt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {apt.location || 'Clinic'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Medications Tab */}
      {activeTab === 'medications' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Medications & Schedules</h2>
            {permissions.canEditMeds ? (
              <button
                onClick={() => setShowAddMedModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 16px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--c-deep-ocean)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.92rem'
                }}
              >
                <Plus size={18} />
                <span>Add Medication</span>
              </button>
            ) : (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Elder has set your account to view-only for medications.
              </span>
            )}
          </div>

          {medications.length === 0 ? (
            <div style={{ padding: '36px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <Pill size={36} color="var(--c-ocean-teal)" style={{ margin: '0 auto 8px auto' }} />
              <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>No medications added yet. Tap "Add Medication" above to create the first schedule.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              {medications.map((med) => (
                <div
                  key={med.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    padding: '20px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 4px 0' }}>
                        {med.name}
                      </h3>
                      <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--c-ocean-teal)' }}>
                        {med.dosage} &bull; {med.frequency}
                      </div>
                    </div>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      backgroundColor: 'var(--status-taken-bg)',
                      color: 'var(--status-taken)'
                    }}>
                      Active
                    </span>
                  </div>

                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '12px 0' }}>
                    {med.instructions}
                  </p>

                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={16} color="var(--text-muted)" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      Scheduled times: {med.timeSlots.join(', ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Appointments Tab */}
      {activeTab === 'appointments' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Doctor Appointments</h2>
            {permissions.canEditAppointments && (
              <button
                onClick={() => setShowAddAptModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 16px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--c-deep-ocean)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.92rem'
                }}
              >
                <Plus size={18} />
                <span>Schedule Visit</span>
              </button>
            )}
          </div>

          {appointments.length === 0 ? (
            <div style={{ padding: '36px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <Calendar size={36} color="var(--c-ocean-teal)" style={{ margin: '0 auto 8px auto' }} />
              <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>No doctor visits scheduled yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '18px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 4px 0' }}>
                      {apt.doctorName}
                    </h3>
                    <div style={{ fontSize: '0.9rem', color: 'var(--c-ocean-teal)', fontWeight: 600 }}>
                      {apt.specialty} &bull; {apt.location}
                    </div>
                    {apt.notes && (
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {apt.notes}
                      </div>
                    )}
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>
                      {new Date(apt.scheduledAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {new Date(apt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Audit Trail Tab */}
      {activeTab === 'audit' && (
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Tamper-Evident Audit Trail</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Full accountability history: who modified medications, who took doses, and automated escalation dispatches.
          </p>

          {auditLogs.length === 0 ? (
            <div style={{ padding: '36px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <p style={{ color: 'var(--text-muted)' }}>No audit events recorded yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor: 'var(--bg-subtle)',
                        color: 'var(--text-muted)'
                      }}>
                        {log.action}
                      </span>
                      <span style={{ fontSize: '0.92rem', color: 'var(--text-main)', fontWeight: 600 }}>
                        {log.details}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      By {log.performedBy.name} ({log.performedBy.role})
                    </div>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Medication Modal with Gemini Parser */}
      {showAddMedModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 100
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            maxWidth: '560px',
            width: '100%',
            padding: '28px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--c-deep-ocean)', marginBottom: '6px' }}>
              Add Medication
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Add a new schedule for senior. You can use Gemini AI to convert doctor instructions into schedules automatically.
            </p>

            {/* Gemini Assistant Box */}
            <div style={{
              backgroundColor: 'var(--primary-light)',
              border: '1px solid var(--c-ocean-teal)',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <Sparkles size={18} color="var(--c-deep-ocean)" />
                <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--c-deep-ocean)' }}>
                  Gemini Prescription Parser
                </span>
              </div>
              <textarea
                value={prescriptionInput}
                onChange={(e) => setPrescriptionInput(e.target.value)}
                placeholder="Example: 1 Metformin 500mg tablet after breakfast and after dinner for 2 weeks"
                rows={2}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-strong)',
                  fontSize: '0.9rem',
                  marginBottom: '10px'
                }}
              />
              <button
                type="button"
                onClick={handleParseAi}
                disabled={isAiParsing}
                style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--c-deep-ocean)',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '0.85rem'
                }}
              >
                {isAiParsing ? 'Analyzing with Gemini...' : 'Parse with Gemini'}
              </button>
            </div>

            {parsedAiResult && (
              <div style={{
                backgroundColor: 'var(--status-taken-bg)',
                padding: '12px',
                borderRadius: '6px',
                marginBottom: '16px',
                fontSize: '0.85rem',
                color: 'var(--status-taken)'
              }}>
                <strong>AI Suggestion Generated.</strong> Please review and confirm the form fields below before saving.
              </div>
            )}

            {/* Medication Form */}
            <form onSubmit={handleSaveMedication}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                  Medication Name
                </label>
                <input
                  type="text"
                  required
                  value={manualMedForm.name}
                  onChange={(e) => setManualMedForm({ ...manualMedForm, name: e.target.value })}
                  placeholder="e.g. Metformin"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-strong)' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                  Dosage
                </label>
                <input
                  type="text"
                  required
                  value={manualMedForm.dosage}
                  onChange={(e) => setManualMedForm({ ...manualMedForm, dosage: e.target.value })}
                  placeholder="e.g. 500 mg (1 tablet)"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-strong)' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                  Senior Instructions
                </label>
                <input
                  type="text"
                  required
                  value={manualMedForm.instructions}
                  onChange={(e) => setManualMedForm({ ...manualMedForm, instructions: e.target.value })}
                  placeholder="e.g. Take after breakfast with warm water"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-strong)' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                  Daily Time Slots (24hr format, comma-separated)
                </label>
                <input
                  type="text"
                  required
                  value={manualMedForm.timeSlots}
                  onChange={(e) => setManualMedForm({ ...manualMedForm, timeSlots: e.target.value })}
                  placeholder="08:00, 20:00"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-strong)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddMedModal(false)}
                  style={{ padding: '10px 16px', borderRadius: '6px', border: '1px solid var(--border-strong)', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 18px', borderRadius: '6px', backgroundColor: 'var(--c-deep-ocean)', color: '#FFFFFF', fontWeight: 700 }}
                >
                  Save Medication
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Appointment Modal */}
      {showAddAptModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 100
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            maxWidth: '480px',
            width: '100%',
            padding: '24px'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--c-deep-ocean)', marginBottom: '16px' }}>
              Schedule Doctor Appointment
            </h3>
            <form onSubmit={handleSaveAppointment}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Doctor Name</label>
                <input
                  type="text"
                  required
                  value={aptForm.doctorName}
                  onChange={(e) => setAptForm({ ...aptForm, doctorName: e.target.value })}
                  placeholder="Dr. Rajiv Mehta"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-strong)' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Specialty</label>
                <input
                  type="text"
                  value={aptForm.specialty}
                  onChange={(e) => setAptForm({ ...aptForm, specialty: e.target.value })}
                  placeholder="Cardiologist"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-strong)' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Location / Clinic</label>
                <input
                  type="text"
                  value={aptForm.location}
                  onChange={(e) => setAptForm({ ...aptForm, location: e.target.value })}
                  placeholder="Apollo Care Clinic, Room 302"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-strong)' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={aptForm.scheduledAt}
                  onChange={(e) => setAptForm({ ...aptForm, scheduledAt: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-strong)' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Notes</label>
                <input
                  type="text"
                  value={aptForm.notes}
                  onChange={(e) => setAptForm({ ...aptForm, notes: e.target.value })}
                  placeholder="Bring BP record"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-strong)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowAddAptModal(false)}
                  style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid var(--border-strong)', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', borderRadius: '6px', backgroundColor: 'var(--c-deep-ocean)', color: '#FFFFFF', fontWeight: 700 }}
                >
                  Confirm Visit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
