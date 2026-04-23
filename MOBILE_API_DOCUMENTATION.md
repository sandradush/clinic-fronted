# Mobile App API Endpoints Documentation

This document outlines the API endpoints that need to be implemented on the backend to support mobile app integration for consultation summaries.

## Required Backend Endpoints

### 1. Send Consultation Summary to Mobile App
**Endpoint:** `POST /api/mobile/consultation-summary`

**Purpose:** Send formatted consultation summary to mobile app

**Request Body:**
```json
{
  "appointment_id": 123,
  "patient_id": 456,
  "doctor_name": "Dr. Smith",
  "consultation_date": "2024-01-15T10:30:00Z",
  "summary": {
    "diagnosis": "Common cold with mild fever",
    "treatment": "Rest, fluids, paracetamol as needed",
    "recommendations": "Stay hydrated, avoid cold foods",
    "follow_up": "Return if symptoms worsen after 3 days",
    "additional_notes": "Patient responded well to examination"
  },
  "formatted_text": "**DIAGNOSIS:**\nCommon cold with mild fever\n\n**TREATMENT:**\nRest, fluids, paracetamol as needed",
  "download_available": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Consultation summary sent to mobile app",
  "consultation_id": 789
}
```

### 2. Send Push Notification to Mobile App
**Endpoint:** `POST /api/mobile/push-notification`

**Purpose:** Send push notification to patient's mobile device

**Request Body:**
```json
{
  "user_id": 456,
  "title": "New Consultation Summary Available",
  "body": "Dr. Smith has completed your consultation. Tap to view your summary.",
  "data": {
    "type": "consultation_summary",
    "appointment_id": 123,
    "doctor_name": "Dr. Smith",
    "date": "2024-01-15T10:30:00Z",
    "action_url": "smarthealth://consultation/123"
  },
  "priority": "high",
  "sound": "default",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Push notification sent successfully",
  "notification_id": "abc123"
}
```

### 3. Get Mobile Consultation Summaries
**Endpoint:** `GET /api/mobile/patient/{patient_id}/consultations`

**Purpose:** Retrieve consultation summaries formatted for mobile app

**Response:**
```json
{
  "success": true,
  "consultations": [
    {
      "id": 789,
      "title": "Consultation Summary - John Doe",
      "summary": "**DIAGNOSIS:**\nCommon cold...",
      "diagnosis": "Common cold with mild fever",
      "treatment": "Rest, fluids, paracetamol as needed",
      "recommendations": "Stay hydrated, avoid cold foods",
      "followUp": "Return if symptoms worsen after 3 days",
      "notes": "Patient responded well to examination",
      "doctorName": "Dr. Smith",
      "doctorId": 123,
      "patientId": 456,
      "appointmentId": 123,
      "consultationDate": "2024-01-15T10:30:00Z",
      "createdAt": "2024-01-15T10:35:00Z",
      "downloadUrl": "https://api.example.com/mobile/consultation/789/download"
    }
  ]
}
```

### 4. Generate Mobile Download Link
**Endpoint:** `POST /api/mobile/consultation/{consultation_id}/download-link`

**Purpose:** Generate secure download link for consultation summary

**Request Body:**
```json
{
  "patient_id": 456
}
```

**Response:**
```json
{
  "success": true,
  "download_url": "https://api.example.com/download/consultation/abc123def456?expires=1642248000",
  "expires_at": "2024-01-15T12:00:00Z"
}
```

### 5. Register Mobile Device
**Endpoint:** `POST /api/mobile/register-device`

**Purpose:** Register mobile device for push notifications

**Request Body:**
```json
{
  "user_id": 456,
  "device_token": "firebase_or_apns_token_here",
  "platform": "ios", // or "android"
  "registered_at": "2024-01-15T10:30:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Device registered successfully",
  "device_id": "device123"
}
```

## Mobile App Deep Links

The mobile app should handle these deep link formats:

- `smarthealth://consultation/{appointment_id}` - Open specific consultation
- `smarthealth://consultations` - Open consultations list
- `smarthealth://download/{consultation_id}` - Download consultation summary

## Push Notification Payload Structure

### iOS (APNs)
```json
{
  "aps": {
    "alert": {
      "title": "New Consultation Summary Available",
      "body": "Dr. Smith has completed your consultation. Tap to view your summary."
    },
    "sound": "default",
    "badge": 1
  },
  "data": {
    "type": "consultation_summary",
    "appointment_id": 123,
    "doctor_name": "Dr. Smith",
    "action_url": "smarthealth://consultation/123"
  }
}
```

### Android (FCM)
```json
{
  "notification": {
    "title": "New Consultation Summary Available",
    "body": "Dr. Smith has completed your consultation. Tap to view your summary.",
    "sound": "default"
  },
  "data": {
    "type": "consultation_summary",
    "appointment_id": "123",
    "doctor_name": "Dr. Smith",
    "action_url": "smarthealth://consultation/123"
  },
  "android": {
    "priority": "high"
  }
}
```

## Database Schema Additions

### Mobile Devices Table
```sql
CREATE TABLE mobile_devices (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  device_token VARCHAR(255) NOT NULL,
  platform ENUM('ios', 'android') NOT NULL,
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Mobile Notifications Table
```sql
CREATE TABLE mobile_notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  data JSON,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  delivered_at TIMESTAMP NULL,
  opened_at TIMESTAMP NULL,
  status ENUM('sent', 'delivered', 'opened', 'failed') DEFAULT 'sent',
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## Implementation Notes

1. **Authentication:** All mobile endpoints should use the same JWT token authentication as web endpoints.

2. **Rate Limiting:** Implement rate limiting for push notifications to prevent spam.

3. **Error Handling:** Return consistent error responses with appropriate HTTP status codes.

4. **Logging:** Log all mobile API requests for debugging and analytics.

5. **Security:** Validate all input data and sanitize before processing.

6. **Push Notification Services:**
   - iOS: Use Apple Push Notification service (APNs)
   - Android: Use Firebase Cloud Messaging (FCM)

7. **File Downloads:** Generate secure, time-limited download URLs for consultation summaries.

8. **Offline Support:** Consider implementing data synchronization for offline mobile app usage.

## Testing

Test the mobile integration with:
- iOS simulator/device
- Android emulator/device
- Push notification testing tools
- Deep link testing
- Download functionality testing

## Security Considerations

- Encrypt sensitive data in push notifications
- Use HTTPS for all API endpoints
- Implement proper authentication and authorization
- Validate device tokens before sending notifications
- Log security events for monitoring