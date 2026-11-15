export type Role = 'ELDER' | 'CARETAKER' | 'FAMILY' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  elderProfileId?: string | null;
  linkCode?: string | null;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  instructions: string;
  frequency: string;
  timeSlots: string[];
  isActive: boolean;
}

export interface DoseSchedule {
  id: string;
  medicationId: string;
  medication: Medication;
  scheduledFor: string;
  status: 'PENDING' | 'TAKEN' | 'MISSED';
  takenAt?: string | null;
  escalationLevel: number;
  lastNotifiedAt?: string | null;
  notificationLog?: string | null;
}

export interface Appointment {
  id: string;
  doctorName: string;
  specialty?: string;
  location?: string;
  scheduledAt: string;
  notes?: string;
}

export interface CaregiverLink {
  id: string;
  relationship: string;
  canEditMeds: boolean;
  canEditAppointments: boolean;
  canViewLogs: boolean;
  status: 'ACTIVE' | 'REVOKED';
  caregiver: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: Role;
  };
}

export interface AssistantChatMessage {
  id: string;
  sender: 'USER' | 'ASSISTANT';
  message: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  createdAt: string;
  performedBy: {
    id: string;
    name: string;
    role: Role;
    email?: string;
  };
  elderProfile?: {
    user: {
      name: string;
    };
  };
}

export interface AdminMetrics {
  totalUsers: number;
  totalElders: number;
  totalCaregivers: number;
  totalMeds: number;
  totalDoses: number;
  takenDoses: number;
  missedDoses: number;
  adherenceRate: number;
}
