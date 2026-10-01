import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  getDocFromServer,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errors';
import {
  Tuition,
  Student,
  AttendanceRecord,
  MolisabAttendanceRecord,
  FeeRecord,
  NotificationRecord,
  AppSettings,
} from '../types';
import { INITIAL_TUITIONS, INITIAL_STUDENTS, INITIAL_SETTINGS } from '../data/initialData';

// Test connection on boot as specified in the Firebase skill
export async function testConnection(): Promise<boolean> {
  try {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Connection check timed out, continuing in offline-first mode')), 2000)
    );
    await Promise.race([
      getDocFromServer(doc(db, 'test', 'connection')),
      timeout,
    ]);
    return true;
  } catch (error) {
    // Graceful offline fallback - dataService will use cached/local data automatically
    return false;
  }
}

// ----------------- Tuitions -----------------
export function subscribeTuitions(
  onSuccess: (tuitions: Tuition[]) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, 'tuitions');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const data: Tuition[] = [];
      snapshot.forEach((docSnap) => {
        data.push({ id: docSnap.id, ...(docSnap.data() as Omit<Tuition, 'id'>) });
      });
      onSuccess(data);
    },
    (err) => {
      onError?.(err);
      handleFirestoreError(err, OperationType.GET, 'tuitions');
    }
  );
}

export async function saveTuition(tuition: Tuition): Promise<void> {
  try {
    const docRef = doc(db, 'tuitions', tuition.id);
    await setDoc(docRef, {
      ...tuition,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `tuitions/${tuition.id}`);
  }
}

export async function deleteTuition(id: string): Promise<void> {
  try {
    const docRef = doc(db, 'tuitions', id);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `tuitions/${id}`);
  }
}

// ----------------- Students -----------------
export function subscribeStudents(
  onSuccess: (students: Student[]) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, 'students');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const data: Student[] = [];
      snapshot.forEach((docSnap) => {
        data.push({ id: docSnap.id, ...(docSnap.data() as Omit<Student, 'id'>) });
      });
      onSuccess(data);
    },
    (err) => {
      onError?.(err);
      handleFirestoreError(err, OperationType.GET, 'students');
    }
  );
}

export async function saveStudent(student: Student): Promise<void> {
  try {
    const docRef = doc(db, 'students', student.id);
    await setDoc(docRef, {
      ...student,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `students/${student.id}`);
  }
}

export async function deleteStudent(id: string): Promise<void> {
  try {
    const docRef = doc(db, 'students', id);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `students/${id}`);
  }
}

// ----------------- Attendance -----------------
export function subscribeAttendance(
  date: string,
  onSuccess: (records: AttendanceRecord[]) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, 'attendance');
  const q = query(colRef, where('date', '==', date));
  return onSnapshot(
    q,
    (snapshot) => {
      const data: AttendanceRecord[] = [];
      snapshot.forEach((docSnap) => {
        data.push({ id: docSnap.id, ...(docSnap.data() as Omit<AttendanceRecord, 'id'>) });
      });
      onSuccess(data);
    },
    (err) => {
      onError?.(err);
      handleFirestoreError(err, OperationType.GET, 'attendance');
    }
  );
}

export function subscribeAllAttendance(
  onSuccess: (records: AttendanceRecord[]) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, 'attendance');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const data: AttendanceRecord[] = [];
      snapshot.forEach((docSnap) => {
        data.push({ id: docSnap.id, ...(docSnap.data() as Omit<AttendanceRecord, 'id'>) });
      });
      onSuccess(data);
    },
    (err) => {
      onError?.(err);
      handleFirestoreError(err, OperationType.GET, 'attendance');
    }
  );
}

export async function saveAttendanceRecord(record: AttendanceRecord): Promise<void> {
  try {
    const docRef = doc(db, 'attendance', record.id);
    await setDoc(docRef, {
      ...record,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `attendance/${record.id}`);
  }
}

// ----------------- Molisab Attendance & Signatures -----------------
export function subscribeMolisabAttendance(
  date: string,
  onSuccess: (records: MolisabAttendanceRecord[]) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, 'molisab_attendance');
  const q = query(colRef, where('date', '==', date));
  return onSnapshot(
    q,
    (snapshot) => {
      const data: MolisabAttendanceRecord[] = [];
      snapshot.forEach((docSnap) => {
        data.push({ id: docSnap.id, ...(docSnap.data() as Omit<MolisabAttendanceRecord, 'id'>) });
      });
      onSuccess(data);
    },
    (err) => {
      onError?.(err);
      handleFirestoreError(err, OperationType.GET, 'molisab_attendance');
    }
  );
}

export function subscribeAllMolisabAttendance(
  onSuccess: (records: MolisabAttendanceRecord[]) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, 'molisab_attendance');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const data: MolisabAttendanceRecord[] = [];
      snapshot.forEach((docSnap) => {
        data.push({ id: docSnap.id, ...(docSnap.data() as Omit<MolisabAttendanceRecord, 'id'>) });
      });
      onSuccess(data);
    },
    (err) => {
      onError?.(err);
      handleFirestoreError(err, OperationType.GET, 'molisab_attendance');
    }
  );
}

export async function saveMolisabAttendanceRecord(record: MolisabAttendanceRecord): Promise<void> {
  try {
    const docRef = doc(db, 'molisab_attendance', record.id);
    await setDoc(docRef, {
      ...record,
      markedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `molisab_attendance/${record.id}`);
  }
}

// ----------------- Fees -----------------
export function subscribeFees(
  onSuccess: (fees: FeeRecord[]) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, 'fees');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const data: FeeRecord[] = [];
      snapshot.forEach((docSnap) => {
        data.push({ id: docSnap.id, ...(docSnap.data() as Omit<FeeRecord, 'id'>) });
      });
      onSuccess(data);
    },
    (err) => {
      onError?.(err);
      handleFirestoreError(err, OperationType.GET, 'fees');
    }
  );
}

export async function saveFeeRecord(fee: FeeRecord): Promise<void> {
  try {
    const docRef = doc(db, 'fees', fee.id);
    await setDoc(docRef, {
      ...fee,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `fees/${fee.id}`);
  }
}

// ----------------- Notifications -----------------
export function subscribeNotifications(
  onSuccess: (notes: NotificationRecord[]) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, 'notifications');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const data: NotificationRecord[] = [];
      snapshot.forEach((docSnap) => {
        data.push({ id: docSnap.id, ...(docSnap.data() as Omit<NotificationRecord, 'id'>) });
      });
      // Sort in memory by createdAt descending
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onSuccess(data);
    },
    (err) => {
      onError?.(err);
      handleFirestoreError(err, OperationType.GET, 'notifications');
    }
  );
}

export async function saveNotificationRecord(notif: NotificationRecord): Promise<void> {
  try {
    const docRef = doc(db, 'notifications', notif.id);
    await setDoc(docRef, notif);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `notifications/${notif.id}`);
  }
}

// ----------------- Settings -----------------
export function subscribeSettings(
  onSuccess: (settings: AppSettings) => void,
  onError?: (err: Error) => void
) {
  const docRef = doc(db, 'settings', 'general');
  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        onSuccess(docSnap.data() as AppSettings);
      } else {
        onSuccess(INITIAL_SETTINGS);
      }
    },
    (err) => {
      onError?.(err);
      handleFirestoreError(err, OperationType.GET, 'settings/general');
    }
  );
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    const docRef = doc(db, 'settings', 'general');
    await setDoc(docRef, {
      ...settings,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'settings/general');
  }
}

// ----------------- Seeding & Demo Population -----------------
export async function seedDatabaseIfEmpty(): Promise<boolean> {
  try {
    const tuitionSnapshot = await getDocs(collection(db, 'tuitions'));
    if (!tuitionSnapshot.empty) {
      return false; // already seeded
    }

    // Seed Tuitions
    for (const t of INITIAL_TUITIONS) {
      await setDoc(doc(db, 'tuitions', t.id), {
        ...t,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // Seed Students
    for (const s of INITIAL_STUDENTS) {
      await setDoc(doc(db, 'students', s.id), {
        ...s,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // Seed Initial Settings
    await setDoc(doc(db, 'settings', 'general'), {
      ...INITIAL_SETTINGS,
      updatedAt: new Date().toISOString(),
    });

    // Seed current month fee records for all students
    const today = new Date();
    const currentMonth = today.toLocaleString('default', { month: 'long', year: 'numeric' });
    const currentYear = today.getFullYear();

    for (let i = 0; i < INITIAL_STUDENTS.length; i++) {
      const student = INITIAL_STUDENTS[i];
      const isPaid = i % 3 === 0;
      const isPartial = i % 5 === 0 && !isPaid;
      const paidAmount = isPaid ? student.monthlyFee : isPartial ? Math.round(student.monthlyFee / 2) : 0;
      const status = isPaid ? 'Paid' : isPartial ? 'Partially Paid' : 'Pending';

      const feeRec: FeeRecord = {
        id: `fee-${student.id}-${currentYear}-${today.getMonth() + 1}`,
        studentId: student.id,
        studentName: student.fullName,
        tuitionId: student.tuitionId,
        parentPhone: student.parentPhone,
        month: currentMonth,
        year: currentYear,
        totalAmount: student.monthlyFee,
        paidAmount,
        balance: student.monthlyFee - paidAmount,
        status,
        receiptNumber: `REC-${currentYear}-${(1000 + i).toString()}`,
        paymentMethod: isPaid || isPartial ? 'Cash' : undefined,
        paymentDate: isPaid || isPartial ? today.toISOString().split('T')[0] : undefined,
        notes: isPaid ? 'Payment received in full' : isPartial ? 'Half fee received' : 'Due by 10th',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'fees', feeRec.id), feeRec);
    }

    // Seed initial announcement
    const welcomeNotif: NotificationRecord = {
      id: `notif-welcome-${Date.now()}`,
      targetType: 'all',
      title: 'Welcome to STUDENTS REGISTER',
      message: 'Assalamu Alaikum. Tuition session records are now managed on the Students Register cloud portal.',
      type: 'announcement',
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'notifications', welcomeNotif.id), welcomeNotif);

    return true;
  } catch (err) {
    console.error('Seeding error:', err);
    return false;
  }
}
