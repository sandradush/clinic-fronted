# Appointment Summary Endpoints Reference

## Current Working Endpoints

### 1. Save Consultation Summary
```http
POST /prescriptions
Content-Type: application/json

{
  "appointment_id": 123,
  "title": "Consultation Summary - Patient Name",
  "note": "DIAGNOSIS:\nPrimary diagnosis here\n\nTREATMENT:\nTreatment plan here\n\nRECOMMENDATIONS:\nRecommendations here\n\nFOLLOW-UP:\nFollow-up instructions\n\nADDITIONAL NOTES:\nAny additional notes"
}
```

### 2. Get Prescriptions for Specific Appointment (Doctor History)
```http
GET /prescriptions/appointment/{appointmentId}
Authorization: Bearer {token}

Response: [
  {
    "id": 1,
    "appointment_id": 123,
    "title": "Consultation Summary - Patient Name",
    "note": "DIAGNOSIS:\n...",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

### 3. Get All Patient Prescriptions (Patient Mobile View)
```http
GET /prescriptions/patient/{patientId}
Authorization: Bearer {token}

Response: [
  {
    "id": 1,
    "appointment_id": 123,
    "title": "Consultation Summary - Patient Name",
    "note": "DIAGNOSIS:\n...",
    "created_at": "2024-01-15T10:30:00Z",
    "appointment": {
      "date": "2024-01-15",
      "time": "10:00",
      "doctor_name": "Dr. Smith"
    }
  }
]
```

### 4. Get Doctor's Appointments (For History)
```http
GET /appointments/doctor/{doctorId}
Authorization: Bearer {token}

Response: [
  {
    "id": 123,
    "date": "2024-01-15",
    "time": "10:00",
    "status": "completed",
    "patient_id": 456,
    "patient_name": "John Doe",
    "doctor_id": 789,
    "doctor_name": "Dr. Smith"
  }
]
```

## Additional Useful Endpoints (Optional)

### 5. Get Summary by Appointment ID (Alternative)
```http
GET /appointments/{appointmentId}/summary
Authorization: Bearer {token}

Response: {
  "appointment_id": 123,
  "summary": "DIAGNOSIS:\n...",
  "created_at": "2024-01-15T10:30:00Z",
  "doctor_name": "Dr. Smith",
  "patient_name": "John Doe"
}
```

### 6. Update Existing Summary
```http
PUT /prescriptions/{prescriptionId}
Content-Type: application/json

{
  "title": "Updated Consultation Summary",
  "note": "Updated summary content..."
}
```

## Data Flow

1. **Consultation Complete**: Doctor fills form → POST /prescriptions
2. **Doctor History**: GET /appointments/doctor/{id} + GET /prescriptions/appointment/{id}
3. **Patient Mobile**: GET /prescriptions/patient/{id}
4. **Summary Display**: Both doctor and patient see formatted consultation summaries

## Mobile Considerations

- PatientPrescriptions.tsx is already mobile-responsive
- Includes download functionality for offline access
- Formatted display with proper sections (DIAGNOSIS, TREATMENT, etc.)
- Modal view for detailed reading on small screens