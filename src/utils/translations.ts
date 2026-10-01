export interface TranslationKeys {
  appName: string;
  teacherTitle: string;
  molisabApp: string;
  parentsApp: string;
  dashboard: string;
  tuitions: string;
  students: string;
  attendance: string;
  fees: string;
  notifications: string;
  reports: string;
  settings: string;
  molisabAttendance: string;
  present: string;
  absent: string;
  leave: string;
  paid: string;
  pending: string;
  partiallyPaid: string;
  totalTuitions: string;
  totalStudents: string;
  todayPresent: string;
  todayAbsent: string;
  todayMolisabStatus: string;
  receivedFees: string;
  pendingFees: string;
  upcomingSchedules: string;
  quickActions: string;
  searchStudents: string;
  filterByTuition: string;
  addStudent: string;
  addTuition: string;
  markAttendance: string;
  saveAttendance: string;
  signAttendance: string;
  signaturePad: string;
  clearSignature: string;
  saveSignature: string;
  feeReceipt: string;
  sendWhatsApp: string;
  childProfile: string;
  playNaat: string;
  naatPlayer: string;
  phoneLogin: string;
  enterMobile: string;
  verifyOtp: string;
  contactTeacher: string;
  switchRole: string;
  installApp: string;
  offlineNotice: string;
}

export const translations: Record<'en' | 'ro' | 'ur', TranslationKeys> = {
  en: {
    appName: 'STUDENTS REGISTER',
    teacherTitle: 'Albaksh Molsab',
    molisabApp: 'Molisab App (Teacher)',
    parentsApp: 'Parents App (Guardian)',
    dashboard: 'Dashboard',
    tuitions: 'Tuitions & Batches',
    students: 'Students Register',
    attendance: 'Attendance',
    fees: 'Fees Management',
    notifications: 'Notifications',
    reports: 'Reports & Export',
    settings: 'Settings',
    molisabAttendance: 'Molisab Sign-in',
    present: 'Present',
    absent: 'Absent',
    leave: 'Leave',
    paid: 'Paid',
    pending: 'Pending',
    partiallyPaid: 'Partial',
    totalTuitions: 'Total Tuitions',
    totalStudents: 'Total Students',
    todayPresent: 'Today Present',
    todayAbsent: 'Today Absent',
    todayMolisabStatus: 'Molisab Attendance',
    receivedFees: 'Received Fees',
    pendingFees: 'Pending Fees',
    upcomingSchedules: 'Upcoming Sessions',
    quickActions: 'Quick Actions',
    searchStudents: 'Search by student, parent or phone...',
    filterByTuition: 'Filter by Tuition',
    addStudent: 'Add Student',
    addTuition: 'Add Tuition Batch',
    markAttendance: 'Mark Attendance',
    saveAttendance: 'Save Attendance',
    signAttendance: 'Sign Attendance',
    signaturePad: 'Touchscreen Signature Pad',
    clearSignature: 'Clear Signature',
    saveSignature: 'Confirm & Save Signature',
    feeReceipt: 'Digital Fee Receipt',
    sendWhatsApp: 'Send WhatsApp Reminder',
    childProfile: "Child's Overview",
    playNaat: 'Play Naat Sharif',
    naatPlayer: 'Naat Audio Player',
    phoneLogin: 'Parent Mobile Login',
    enterMobile: 'Enter Registered Mobile Number',
    verifyOtp: 'Verify OTP Code',
    contactTeacher: 'Contact Albaksh Molsab',
    switchRole: 'Switch App View',
    installApp: 'Install Android App (APK/PWA)',
    offlineNotice: 'Offline Mode: Sync will resume automatically once connected.',
  },
  ro: {
    appName: 'STUDENTS REGISTER',
    teacherTitle: 'Albaksh Molsab',
    molisabApp: 'Molisab App (Ustaad)',
    parentsApp: 'Parents App (Walidain)',
    dashboard: 'Dashboard',
    tuitions: 'Tuitions & Batches',
    students: 'Students Register',
    attendance: 'Hazri (Attendance)',
    fees: 'Fees Record',
    notifications: 'Paighamat (Alerts)',
    reports: 'Reports & Export',
    settings: 'Settings',
    molisabAttendance: 'Molisab Hazri & Dastakhat',
    present: 'Hazir (Present)',
    absent: 'Ghair Hazir (Absent)',
    leave: 'Rukhsat (Leave)',
    paid: 'Ada Shuda (Paid)',
    pending: 'Baaqi (Pending)',
    partiallyPaid: 'Nisf Ada (Partial)',
    totalTuitions: 'Kul Tuitions',
    totalStudents: 'Kul Talaba',
    todayPresent: 'Aaj Hazir',
    todayAbsent: 'Aaj Ghair Hazir',
    todayMolisabStatus: 'Molisab Hazri',
    receivedFees: 'Wasool Shuda Fees',
    pendingFees: 'Baaqi Fees',
    upcomingSchedules: 'Aane Wali Tuitions',
    quickActions: 'Fauri Iqdamaat',
    searchStudents: 'Bachay ya Walid ke naam se talash karein...',
    filterByTuition: 'Tuition Batch chunein',
    addStudent: 'Naya Talib-e-Ilm Shamil Karein',
    addTuition: 'Naya Tuition Batch Banayein',
    markAttendance: 'Hazri Lagayein',
    saveAttendance: 'Hazri Mehfooz Karein',
    signAttendance: 'Dastakhat Karein',
    signaturePad: 'Touchscreen Dastakhat Pad',
    clearSignature: 'Dobara Dastakhat Karein',
    saveSignature: 'Dastakhat Mehfooz Karein',
    feeReceipt: 'Digital Fees Receipt',
    sendWhatsApp: 'WhatsApp Paigham Bhejein',
    childProfile: 'Bachay Ka Record',
    playNaat: 'Naat Sharif Suniye',
    naatPlayer: 'Naat Audio Player',
    phoneLogin: 'Walidain Mobile Login',
    enterMobile: 'Apna Registered Mobile Number Darj Karein',
    verifyOtp: 'OTP Tasdeeq Karein',
    contactTeacher: 'Albaksh Molsab se Rabta Karein',
    switchRole: 'App Tabdeel Karein',
    installApp: 'Android App Install Karein',
    offlineNotice: 'Internet Band Hai: Data internet aate hi sync ho jayega.',
  },
  ur: {
    appName: 'اسٹوڈنٹس رجسٹر',
    teacherTitle: 'الـبخـش مولوی صاحب',
    molisabApp: 'مولوی صاحب ایپ (استاد)',
    parentsApp: 'والدین ایپ (سرپرست)',
    dashboard: 'ڈیش بورڈ',
    tuitions: 'ٹیوشن بیجز',
    students: 'رجسٹر طلباء',
    attendance: 'حاضری',
    fees: 'فیس ریکارڈ',
    notifications: 'پیغامات اور اعلانات',
    reports: 'رپورٹس اور ڈیٹا',
    settings: 'ترتیبات',
    molisabAttendance: 'مولوی صاحب حاضری و دستخط',
    present: 'حاضر',
    absent: 'غیر حاضر',
    leave: 'رخصت',
    paid: 'ادا شدہ',
    pending: 'باقی / واجب الادا',
    partiallyPaid: 'جزوی ادا شدہ',
    totalTuitions: 'کل ٹیوشنز',
    totalStudents: 'کل رجسٹرڈ طلباء',
    todayPresent: 'آج حاضر طلباء',
    todayAbsent: 'آج غیر حاضر طلباء',
    todayMolisabStatus: 'مولوی صاحب کی حاضری',
    receivedFees: 'وصول شدہ فیس',
    pendingFees: 'باقی فیس',
    upcomingSchedules: 'آئندہ ٹیوشن کے اوقات',
    quickActions: 'فوری اقدامات',
    searchStudents: 'طالب علم یا سرپرست کے نام سے تلاش کریں...',
    filterByTuition: 'بیچ منتخب کریں',
    addStudent: 'نیا طالب علم درج کریں',
    addTuition: 'نیا بیچ شامل کریں',
    markAttendance: 'حاضری درج کریں',
    saveAttendance: 'حاضری محفوظ کریں',
    signAttendance: 'دستخط کریں',
    signaturePad: 'ٹچ اسکرین دستخط پیڈ',
    clearSignature: 'صاف کریں',
    saveSignature: 'دستخط محفوظ کریں',
    feeReceipt: 'ڈیجیٹل فیس رسید',
    sendWhatsApp: 'واٹس ایپ پر میسج بھیجیں',
    childProfile: 'بچے کی تفصیلات',
    playNaat: 'نعت شریف سنیں',
    naatPlayer: 'نعت آڈیو پلیئر',
    phoneLogin: 'والدین موبائل لاگ ان',
    enterMobile: 'اپنا رجسٹرڈ موبائل نمبر درج کریں',
    verifyOtp: 'او ٹی پی تصدیق کریں',
    contactTeacher: 'البخش مولوی صاحب سے رابطہ کریں',
    switchRole: 'ایپ تبدیل کریں',
    installApp: 'اینڈرائیڈ ایپ انسٹال کریں',
    offlineNotice: 'انٹرنیٹ منقطع ہے: انٹرنیٹ بحال ہوتے ہی ڈیٹا خود بخود اپ ڈیٹ ہو جائے گا۔',
  },
};
