import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { DoseSchedule, Appointment, CaregiverLink, Medication } from '../types';
import { speakText } from '../services/speech';
import { ElderCompanion } from './ElderCompanion';
import { 
  CheckCircle2, 
  Volume2, 
  PhoneCall, 
  Calendar, 
  Users, 
  Clock, 
  MessageSquare,
  Copy,
  Check,
  Pill
} from 'lucide-react';

export const ElderView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'overview' | 'companion' | 'appointments' | 'people'>('schedule');
  const [nextDose, setNextDose] = useState<DoseSchedule | null>(null);
  const [allDoses, setAllDoses] = useState<DoseSchedule[]>([]);
  const [allMedications, setAllMedications] = useState<Medication[]>([]);
  const [emergencyPhone, setEmergencyPhone] = useState<string | null>(null);
  const [linkCode, setLinkCode] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [caregivers, setCaregivers] = useState<CaregiverLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const loadSchedule = async () => {
    try {
      const res = await apiRequest<{
        success: boolean;
        data: {
          nextDueDose: DoseSchedule | null;
          allDosesToday: DoseSchedule[];
          emergencyPhone: string | null;
          linkCode: string | null;
        };
      }>('/api/elder/today');

      if (res.success) {
        setNextDose(res.data.nextDueDose);
        setAllDoses(res.data.allDosesToday);
        setEmergencyPhone(res.data.emergencyPhone);
        setLinkCode(res.data.linkCode);
      }
    } catch (err) {
      console.error('Failed to load elder schedule', err);
    }
  };

  const loadAppointments = async () => {
    try {
      const res = await apiRequest<{ success: boolean; appointments: Appointment[] }>('/api/elder/appointments');
      if (res.success && res.appointments) {
        setAppointments(res.appointments);
      }
    } catch (err) {
      console.error('Failed to load appointments', err);
    }
  };

  const loadCaregivers = async () => {
    try {
      const res = await apiRequest<{ success: boolean; linkCode: string; caregivers: CaregiverLink[] }>('/api/elder/my-people');
      if (res.success && res.caregivers) {
        setCaregivers(res.caregivers);
        if (res.linkCode) setLinkCode(res.linkCode);
      }
    } catch (err) {
      console.error('Failed to load caregivers', err);
    }
  };

  const loadMedications = async () => {
    try {
      const res = await apiRequest<{ success: boolean; medications: Medication[] }>('/api/elder/medications');
      if (res.success && res.medications) {
        setAllMedications(res.medications);
      }
    } catch (err) {
      console.error('Failed to load medications', err);
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      await Promise.all([loadSchedule(), loadAppointments(), loadCaregivers(), loadMedications()]);
      setIsLoading(false);
    };
    fetchAll();
  }, []);

  const handleConfirmDose = async (doseId: string) => {
    try {
      const res = await apiRequest<{ success: boolean; message: string }>('/api/elder/confirm-dose', {
        method: 'POST',
        body: JSON.stringify({ doseId })
      });

      if (res.success) {
        setActionMessage('Dose recorded successfully.');
        setTimeout(() => setActionMessage(null), 4000);
        speakText('Thank you. Dose marked as taken.');
        loadSchedule();
      }
    } catch (err: any) {
      alert(err.message || 'Could not record dose.');
    }
  };

  const handleReadAloud = (dose: DoseSchedule) => {
    const timeFormatted = new Date(dose.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const text = `Time for ${dose.medication.name}, ${dose.medication.dosage}. ${dose.medication.instructions}. Scheduled for ${timeFormatted}.`;
    speakText(text);
  };

  const handleReadMedicationAloud = (med: Medication) => {
    const times = med.timeSlots.join(' and ');
    const text = `${med.name}, ${med.dosage}. ${med.instructions}. Scheduled daily at ${times}.`;
    speakText(text);
  };

  const handleTogglePermission = async (linkId: string, field: 'canEditMeds' | 'canEditAppointments', currentValue: boolean) => {
    try {
      await apiRequest('/api/elder/permissions', {
        method: 'PUT',
        body: JSON.stringify({
          linkId,
          [field]: !currentValue
        })
      });
      loadCaregivers();
    } catch (err: any) {
      alert(err.message || 'Failed to update permission.');
    }
  };

  const handleRevoke = async (linkId: string) => {
    if (!window.confirm('Are you sure you want to revoke access for this caregiver?')) return;

    try {
      await apiRequest('/api/elder/revoke-access', {
        method: 'PUT',
        body: JSON.stringify({ linkId })
      });
      loadCaregivers();
    } catch (err: any) {
      alert(err.message || 'Failed to revoke access.');
    }
  };

  const copyLinkCode = () => {
    if (linkCode) {
      navigator.clipboard.writeText(linkCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  if (isLoading) {
    return (
      <div style={{ maxWidth: '600px', margin: '40px auto', textAlign: 'center', padding: '20px' }}>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>Loading your care portal...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '16px' }}>
      {/* Top Banner: Emergency Contact & Link Code */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderRadius: '8px',
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--border-color)',
        marginBottom: '16px'
      }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Your elder link code</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--c-deep-ocean)', letterSpacing: '1px' }}>
              {linkCode || 'Loading...'}
            </span>
            <button
              onClick={copyLinkCode}
              style={{ padding: '4px', color: 'var(--c-ocean-teal)', cursor: 'pointer' }}
              title="Copy code to share with family"
            >
              {copiedCode ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>

        {emergencyPhone ? (
          <a
            href={`tel:${emergencyPhone}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              borderRadius: '6px',
              backgroundColor: 'var(--status-missed-bg)',
              color: 'var(--status-missed)',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.95rem'
            }}
          >
            <PhoneCall size={18} />
            <span>Emergency</span>
          </a>
        ) : null}
      </div>

      {/* Confirmation alert */}
      {actionMessage && (
        <div style={{
          padding: '14px 18px',
          borderRadius: '8px',
          backgroundColor: 'var(--status-taken-bg)',
          color: 'var(--status-taken)',
          fontWeight: 700,
          fontSize: '1.05rem',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={20} />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Primary Hero Card: NEXT DOSE (Only show on schedule tab) */}
      {activeTab === 'schedule' && nextDose && (
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '2px solid var(--c-deep-ocean)',
          borderRadius: '12px',
          padding: '24px 20px',
          marginBottom: '24px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '12px',
              backgroundColor: nextDose.status === 'MISSED' ? 'var(--status-missed-bg)' : 'var(--status-due-bg)',
              color: nextDose.status === 'MISSED' ? 'var(--status-missed)' : 'var(--status-due)'
            }}>
              {nextDose.status === 'MISSED' ? 'Overdue Dose' : 'Next Dose Scheduled'}
            </span>

            <button
              onClick={() => handleReadAloud(nextDose)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--c-deep-ocean)',
                fontSize: '0.9rem',
                fontWeight: 600
              }}
              aria-label="Read dose instructions aloud"
            >
              <Volume2 size={18} />
              <span>Listen</span>
            </button>
          </div>

          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--c-deep-ocean)', marginBottom: '6px' }}>
            {nextDose.medication.name}
          </h2>

          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--c-ocean-teal)', marginBottom: '8px' }}>
            {nextDose.medication.dosage} &bull; {new Date(nextDose.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>

          <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', marginBottom: '22px', lineHeight: 1.4 }}>
            {nextDose.medication.instructions}
          </p>

          <button
            onClick={() => handleConfirmDose(nextDose.id)}
            style={{
              width: '100%',
              padding: '16px 20px',
              borderRadius: '8px',
              backgroundColor: 'var(--c-deep-ocean)',
              color: '#FFFFFF',
              fontSize: '1.3rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              minHeight: '56px'
            }}
          >
            <CheckCircle2 size={26} />
            <span>I took it</span>
          </button>
        </div>
      )}

      {/* Tabs navigation for seniors */}
      <div style={{
        display: 'flex',
        borderBottom: '2px solid var(--border-color)',
        marginBottom: '20px'
      }}>
        <button
          onClick={() => setActiveTab('schedule')}
          style={{
            flex: 1,
            padding: '14px 0',
            fontSize: '1rem',
            fontWeight: 700,
            color: activeTab === 'schedule' ? 'var(--c-deep-ocean)' : 'var(--text-muted)',
            borderBottom: activeTab === 'schedule' ? '3px solid var(--c-deep-ocean)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <Clock size={18} />
          <span>Today</span>
        </button>

        <button
          onClick={() => setActiveTab('overview')}
          style={{
            flex: 1,
            padding: '14px 0',
            fontSize: '1rem',
            fontWeight: 700,
            color: activeTab === 'overview' ? 'var(--c-deep-ocean)' : 'var(--text-muted)',
            borderBottom: activeTab === 'overview' ? '3px solid var(--c-deep-ocean)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <Pill size={18} />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('companion')}
          style={{
            flex: 1,
            padding: '14px 0',
            fontSize: '1rem',
            fontWeight: 700,
            color: activeTab === 'companion' ? 'var(--c-deep-ocean)' : 'var(--text-muted)',
            borderBottom: activeTab === 'companion' ? '3px solid var(--c-deep-ocean)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <MessageSquare size={18} />
          <span>Assistant</span>
        </button>

        <button
          onClick={() => setActiveTab('appointments')}
          style={{
            flex: 1,
            padding: '14px 0',
            fontSize: '1rem',
            fontWeight: 700,
            color: activeTab === 'appointments' ? 'var(--c-deep-ocean)' : 'var(--text-muted)',
            borderBottom: activeTab === 'appointments' ? '3px solid var(--c-deep-ocean)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <Calendar size={18} />
          <span>Visits</span>
        </button>

        <button
          onClick={() => setActiveTab('people')}
          style={{
            flex: 1,
            padding: '14px 0',
            fontSize: '1rem',
            fontWeight: 700,
            color: activeTab === 'people' ? 'var(--c-deep-ocean)' : 'var(--text-muted)',
            borderBottom: activeTab === 'people' ? '3px solid var(--c-deep-ocean)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <Users size={18} />
          <span>People</span>
        </button>
      </div>

      {/* Tab 1: Today's Schedule List */}
      {activeTab === 'schedule' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {allDoses.length === 0 ? (
            <div style={{ padding: '32px 20px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <CheckCircle2 size={40} color="var(--c-mint)" style={{ margin: '0 auto 12px auto' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--c-deep-ocean)' }}>No medications scheduled for today</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Your caretaker or doctor has not added active doses for today yet.
              </p>
            </div>
          ) : (
            allDoses.map((dose) => {
              const timeStr = new Date(dose.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const isTaken = dose.status === 'TAKEN';
              const isMissed = dose.status === 'MISSED';

              return (
                <div
                  key={dose.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    opacity: isTaken ? 0.75 : 1
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>{timeStr}</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
                      {dose.medication.name}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                      {dose.medication.dosage} &bull; {dose.medication.instructions}
                    </div>
                  </div>

                  <div>
                    {isTaken ? (
                      <span style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--status-taken-bg)',
                        color: 'var(--status-taken)',
                        fontWeight: 700,
                        fontSize: '0.9rem'
                      }}>
                        Taken
                      </span>
                    ) : isMissed ? (
                      <div style={{ textAlign: 'right' }}>
                        <span style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          backgroundColor: 'var(--status-missed-bg)',
                          color: 'var(--status-missed)',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          display: 'inline-block',
                          marginBottom: '6px'
                        }}>
                          Missed
                        </span>
                        <button
                          onClick={() => handleConfirmDose(dose.id)}
                          style={{
                            display: 'block',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            color: 'var(--c-deep-ocean)',
                            textDecoration: 'underline'
                          }}
                        >
                          Take now
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleConfirmDose(dose.id)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '6px',
                          backgroundColor: 'var(--c-deep-ocean)',
                          color: '#FFFFFF',
                          fontWeight: 700,
                          fontSize: '0.95rem'
                        }}
                      >
                        Take
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab: Overview / All Prescribed Medications */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--c-deep-ocean)', margin: 0 }}>
              All Prescribed Medications
            </h2>
            <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {allMedications.length} {allMedications.length === 1 ? 'medicine' : 'medicines'}
            </span>
          </div>

          {allMedications.length === 0 ? (
            <div style={{ padding: '36px 20px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <Pill size={36} color="var(--c-ocean-teal)" style={{ margin: '0 auto 8px auto' }} />
              <p style={{ color: 'var(--text-muted)', fontWeight: 600, margin: 0 }}>
                No medications have been added yet. Your caretaker or family member can add schedules for you.
              </p>
            </div>
          ) : (
            allMedications.map((med) => (
              <div
                key={med.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '20px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--c-deep-ocean)', margin: '0 0 4px 0' }}>
                      {med.name}
                    </h3>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--c-ocean-teal)' }}>
                      {med.dosage} &bull; {med.frequency}
                    </div>
                  </div>

                  <button
                    onClick={() => handleReadMedicationAloud(med)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--primary-light)',
                      color: 'var(--c-deep-ocean)',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                    aria-label={`Listen to instructions for ${med.name}`}
                  >
                    <Volume2 size={18} />
                    <span>Listen</span>
                  </button>
                </div>

                <p style={{ fontSize: '1rem', color: 'var(--text-main)', margin: '10px 0 14px 0', lineHeight: 1.5 }}>
                  {med.instructions}
                </p>

                <div style={{
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={16} color="var(--text-muted)" />
                    <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      Daily times: {med.timeSlots.join(', ')}
                    </span>
                  </div>
                  <span style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--status-taken-bg)',
                    color: 'var(--status-taken)'
                  }}>
                    Active schedule
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Sathi AI Voice/Chat Assistant */}
      {activeTab === 'companion' && (
        <ElderCompanion />
      )}

      {/* Tab 3: Appointments */}
      {activeTab === 'appointments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {appointments.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <p style={{ color: 'var(--text-muted)' }}>No upcoming doctor appointments scheduled.</p>
            </div>
          ) : (
            appointments.map((apt) => (
              <div
                key={apt.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '18px'
                }}
              >
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--c-ocean-teal)', marginBottom: '4px' }}>
                  {new Date(apt.scheduledAt).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(apt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                  {apt.doctorName}
                </h3>
                {apt.specialty && (
                  <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    {apt.specialty}
                  </div>
                )}
                {apt.location && (
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600 }}>
                    Location: {apt.location}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 4: My People */}
      {activeTab === 'people' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ padding: '14px 16px', borderRadius: '8px', backgroundColor: 'var(--primary-light)', color: 'var(--c-deep-ocean)', fontSize: '0.9rem', fontWeight: 600, border: '1px solid var(--c-ocean-teal)' }}>
            Share your elder link code <strong>{linkCode}</strong> with your family or caretaker to connect.
          </div>

          {caregivers.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <p style={{ color: 'var(--text-muted)' }}>No caregivers linked to your profile yet.</p>
            </div>
          ) : (
            caregivers.map((link) => {
              const isRevoked = link.status === 'REVOKED';

              return (
                <div
                  key={link.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '18px',
                    opacity: isRevoked ? 0.6 : 1
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {link.caregiver.name}
                      </h3>
                      <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                        {link.relationship} &bull; {link.caregiver.email}
                      </div>
                    </div>

                    <span style={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      backgroundColor: isRevoked ? 'var(--status-missed-bg)' : 'var(--status-taken-bg)',
                      color: isRevoked ? 'var(--status-missed)' : 'var(--status-taken)'
                    }}>
                      {isRevoked ? 'Revoked' : 'Active'}
                    </span>
                  </div>

                  {!isRevoked && (
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '12px' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>
                        Elder Permissions:
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={link.canEditMeds}
                            onChange={() => handleTogglePermission(link.id, 'canEditMeds', link.canEditMeds)}
                            style={{ width: '18px', height: '18px' }}
                          />
                          <span>Can add and edit medications</span>
                        </label>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={link.canEditAppointments}
                            onChange={() => handleTogglePermission(link.id, 'canEditAppointments', link.canEditAppointments)}
                            style={{ width: '18px', height: '18px' }}
                          />
                          <span>Can manage doctor appointments</span>
                        </label>
                      </div>

                      <button
                        onClick={() => handleRevoke(link.id)}
                        style={{
                          marginTop: '16px',
                          padding: '8px 14px',
                          borderRadius: '6px',
                          border: '1px solid var(--status-missed)',
                          backgroundColor: 'transparent',
                          color: 'var(--status-missed)',
                          fontSize: '0.88rem',
                          fontWeight: 600
                        }}
                      >
                        Revoke Access
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
