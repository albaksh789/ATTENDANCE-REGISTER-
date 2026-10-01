export type AttendanceStatus = 'Present' | 'Absent' | 'Leave';
export type FeeStatus = 'Paid' | 'Pending' | 'Partially Paid';
export type StudentStatus = 'Active' | 'Inactive';
export type AppLanguage = 'en' | 'ro' | 'ur';

export interface Tuition {
  id: string;
  name: string;
  timing: string;
  startTime?: string;
  endTime?: string;
  feeDueDate: number;
  notes?: string;
  days?: string;
  teacherName?: string;
  studentCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Student {
  id: string;
  fullName: string;
  tuitionId: string;
  tuitionName: string;
  parentName: string;
  parentPhone: string;
  monthlyFee: number;
  admissionDate: string;
  status: StudentStatus;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AttendanceRecord {
  id: string;
  tuitionId: string;
  studentId: string;
  studentName: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  markedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MolisabAttendanceRecord {
  id: string;
  tuitionId: string;
  tuitionName: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  signatureUrl?: string; // base64 PNG data URL
  notes?: string;
  markedAt: string;
  createdAt?: string;
}

export interface FeeRecord {
  id: string;
  studentId: string;
  studentName: string;
  tuitionId: string;
  parentPhone: string;
  month: string;
  year: number;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  status: FeeStatus;
  paymentMethod?: string;
  paymentDate?: string;
  receiptNumber: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationRecord {
  id: string;
  tuitionId?: string;
  targetType: 'all' | 'batch' | 'parent';
  parentPhone?: string;
  title: string;
  message: string;
  type: 'arrival' | 'attendance' | 'fee' | 'holiday' | 'leave' | 'announcement';
  createdAt: string;
}

export interface AppSettings {
  naatTitle: string;
  naatUrl: string;
  naatScheduleMinutes: number;
  arrivalNoticeMinutes: number;
  teacherName: string;
  teacherPhone: string;
  templates: {
    arrival: string;
    attendancePresent: string;
    attendanceAbsent: string;
    feeReminder: string;
    holiday: string;
    molisabLeave: string;
  };
}
