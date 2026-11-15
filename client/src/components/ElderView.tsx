import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { DoseSchedule, Appointment, CaregiverLink } from '../types';
import { speakText } from '../services/speech';
import { CheckCircle2, Volume2, PhoneCall, Calendar, Users, ShieldAlert, AlertTriangle, Clock } from 'lucide-react';

export const ElderView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'appointments' | 'people'>('schedule');
  const [nextDose, setNextDose] = useState<DoseSchedule | null>(null);
  const [allDoses, setAllDoses] = useState<DoseSchedule[]>([]);
  const [emergencyPhone, setEmergencyPhone] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [caregivers, setCaregivers] = useState<CaregiverLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadSchedule = async () => {
    try {
      const res = await apiRequest<{
        success: boolean;
        data: {
          nextDueDose: DoseSchedule | null;
          allDosesToday: DoseSchedule[];
          emergencyPhone: string | null;
        };
      }>('/api/elder/today');

      if (res.success) {
        setNextDose(res.data.nextDueDose);
        setAllDoses(res.data.allDosesToday);
        setEmergencyPhone(res.data.emergencyPhone);
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
      const res = await apiRequest<{ success: boolean; caregivers: CaregiverLink[] }>('/api/elder/my-people');
      if (res.success && res.caregivers) {
        setCaregivers(res.caregivers);
      }
    } catch (err) {
      console.error('Failed to load caregivers', err);
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      await Promise.all([loadSchedule(), loadAppointments(), loadCaregivers()]);
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

  if (isLoading) {
    return (
      <div style={{ maxWidth: '600px', margin: '40px auto', textAlign: 'center', padding: '20px' }}>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>Loading your schedule...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '16px' }}>
      {/* Top Banner: Emergency Contact */}
      {emergencyPhone && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderRadius: '8px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          marginBottom: '16px'
        }}>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Emergency Contact</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>{emergencyPhone}</div>
          </div>
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
            <span>Call Now</span>
          </a>
        </div>
      )}

      {/* Confirmation notification alert */}
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

      {/* Primary Hero Card: NEXT DOSE */}
      {nextDose ? (
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '2px solid var(--primary-teal)',
          borderRadius: '12px',
          padding: '24px 20px',
          marginBottom: '24px'
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
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--primary-teal)',
                fontSize: '0.9rem',
                fontWeight: 600
              }}
              aria-label="Read dose instructions aloud"
            >
              <Volume2 size={18} />
              <span>Listen</span>
            </button>
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
            {nextDose.medication.name}
          </h2>

          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-teal)', marginBottom: '8px' }}>
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
              backgroundColor: 'var(--primary-teal)',
              color: '#FFFFFF',
              fontSize: '1.25rem',
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
      ) : (
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <CheckCircle2 size={40} color="var(--status-taken)" style={{ margin: '0 auto 12px auto' }} />
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '6px' }}>All doses complete for now</h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>You have no pending doses due right now.</p>
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
            color: activeTab === 'schedule' ? 'var(--primary-teal)' : 'var(--text-muted)',
            borderBottom: activeTab === 'schedule' ? '3px solid var(--primary-teal)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <Clock size={18} />
          <span>Today</span>
        </button>

        <button
          onClick={() => setActiveTab('appointments')}
          style={{
            flex: 1,
            padding: '14px 0',
            fontSize: '1rem',
            fontWeight: 700,
            color: activeTab === 'appointments' ? 'var(--primary-teal)' : 'var(--text-muted)',
            borderBottom: activeTab === 'appointments' ? '3px solid var(--primary-teal)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
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
            color: activeTab === 'people' ? 'var(--primary-teal)' : 'var(--text-muted)',
            borderBottom: activeTab === 'people' ? '3px solid var(--primary-teal)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <Users size={18} />
          <span>My People</span>
        </button>
      </div>

      {/* Tab 1: Today's Schedule List */}
      {activeTab === 'schedule' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {allDoses.map((dose) => {
            const timeStr = new Date(dose.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const isTaken = dose.status === 'TAKEN';
            const isMissed = dose.status === 'MISSED';

            return (
              <div
                key={dose.id}
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  opacity: isTaken ? 0.8 : 1
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
                          color: 'var(--primary-teal)',
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
                        backgroundColor: 'var(--primary-teal)',
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
          })}
        </div>
      )}

      {/* Tab 2: Appointments */}
      {activeTab === 'appointments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {appointments.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', backgroundColor: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <p style={{ color: 'var(--text-muted)' }}>No upcoming doctor appointments scheduled.</p>
            </div>
          ) : (
            appointments.map((apt) => (
              <div
                key={apt.id}
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '18px'
                }}
              >
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary-teal)', marginBottom: '4px' }}>
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
                {apt.notes && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                    Note: {apt.notes}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: My People (Elderly Empowerment & Consent) */}
      {activeTab === 'people' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ padding: '12px 16px', borderRadius: '8px', backgroundColor: 'var(--primary-teal-light)', color: 'var(--primary-teal)', fontSize: '0.9rem', fontWeight: 600 }}>
            You are in full control. You can decide what each family member can view or edit, and you can revoke access anytime.
          </div>

          {caregivers.map((link) => {
            const isRevoked = link.status === 'REVOKED';

            return (
              <div
                key={link.id}
                style={{
                  backgroundColor: 'var(--bg-surface)',
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
                      Allowed Permissions:
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
          })}
        </div>
      )}
    </div>
  );
};
