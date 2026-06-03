import { AlertTriangle, AlertCircle, ShieldAlert, Info } from 'lucide-react';

export const PRIORITY_COLORS = {
  critical: '#b71c1c',
  high: '#c62828',
  moderate: '#f57f17',
  low: '#2e7d32',
};

export const PRIORITY_CONFIG = {
  critical: { color: '#b71c1c', bg: '#fce4ec', icon: AlertTriangle },
  high: { color: '#c62828', bg: '#ffebee', icon: AlertCircle },
  moderate: { color: '#f57f17', bg: '#fff8e1', icon: ShieldAlert },
  low: { color: '#2e7d32', bg: '#e8f5e9', icon: Info },
};

export const INCIDENT_STATUSES = ['reported', 'under_review', 'investigating', 'resolved', 'dismissed', 'forwarded'];

export const INCIDENT_STATUS_COLORS = {
  reported: '#4527a0',
  under_review: '#1565c0',
  investigating: '#e65100',
  resolved: '#2e7d32',
  dismissed: '#757575',
  forwarded: '#f57f17',
};

export const MEETING_STATUSES = ['scheduled', 'in_progress', 'completed', 'cancelled'];

export const INCIDENT_TYPES = [
  'Disrespectful Behavior',
  'Physical Altercation',
  'Attendance Issue',
  'Cheating',
  'Bullying',
  'Other',
];

export const MEETING_STATUS_COLORS = {
  scheduled: '#1565c0',
  in_progress: '#e65100',
  completed: '#2e7d32',
  cancelled: '#757575',
};
