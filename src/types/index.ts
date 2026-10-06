export interface ScheduleData {
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  formattedDate: string;
  formattedTime: string;
}

export interface InvitationRecord {
  id: string;
  timestamp: string;
  answer: string;
  selectedDate: string;
  selectedTime: string;
  formattedDate?: string;
  formattedTime?: string;
  notes?: string;
  savedToGoogleSheet?: boolean;
}
