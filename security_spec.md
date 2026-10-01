# Security Specification: STUDENTS REGISTER

## 1. Data Invariants
- Admin operations (creating/updating/deleting tuitions, students, marking attendance, signing, recording fee payments) are strictly restricted to authenticated administrator / teacher (Albaksh Molsab).
- Parents cannot create, modify, or delete any students, attendance, fees, or tuition records.
- Parents can only read attendance, student, and fee records that belong to their linked mobile number.
- Touchscreen signatures for Molisab are locked and tamper-proof once recorded for a session.
- Document IDs must conform to alphanumeric standard identifiers without junk payloads.

## 2. The "Dirty Dozen" Payloads (Denial Scenarios)
1. **Unauthenticated Student Injection**: Non-authenticated write to `/students/student123` -> PERMISSION_DENIED.
2. **Parent Modifying Attendance**: Authenticated parent attempting to mark child "Present" -> PERMISSION_DENIED.
3. **Parent Altering Fee Records**: Authenticated parent attempting to mark fee as "Paid" -> PERMISSION_DENIED.
4. **Forging Molisab Signature**: Non-admin user writing to `/molisab_attendance/session123` -> PERMISSION_DENIED.
5. **Cross-Parent Student Leak**: Parent A querying Student of Parent B -> PERMISSION_DENIED.
6. **Tuition Batch Deletion by Parent**: Parent attempting DELETE `/tuitions/batch1` -> PERMISSION_DENIED.
7. **Junk Character Document ID**: Writing to document ID with oversized 2KB symbol payload -> PERMISSION_DENIED.
8. **Negative Fee Balance Exploit**: Creating fee with invalid string balance or unapproved structure -> PERMISSION_DENIED.
9. **Role Escalation in Users**: User attempting to self-grant admin role -> PERMISSION_DENIED.
10. **Timestamp Tampering**: Client submitting manipulated historical timestamps in place of validated dates -> PERMISSION_DENIED.
11. **Shadow Field Injection**: Writing student record with unexpected elevated permissions fields -> PERMISSION_DENIED.
12. **Notification Broadcast Hijacking**: Parent broadcasting announcement to all batches -> PERMISSION_DENIED.
