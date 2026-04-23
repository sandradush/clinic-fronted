// Mobile App API Integration Utilities
// This file contains functions specifically designed for mobile app integration

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://clinic-backend-s2lx.onrender.com/api';

/**
 * Mobile-friendly consultation summary format
 */
export interface MobileConsultationSummary {
  id: number;
  title: string;
  summary: string;
  diagnosis: string;
  treatment: string;
  recommendations: string;
  followUp: string;
  notes: string;
  doctorName: string;
  doctorId: number;
  patientId: number;
  appointmentId: number;
  consultationDate: string;
  createdAt: string;
  downloadUrl?: string;
}

/**
 * Push notification payload for mobile apps
 */
export interface MobilePushNotification {
  user_id: number;
  title: string;
  body: string;
  data: {
    type: 'consultation_summary' | 'appointment_reminder' | 'prescription_ready';
    appointment_id?: number;
    prescription_id?: number;
    doctor_name?: string;
    date: string;
    action_url?: string;
  };
  priority?: 'high' | 'normal';
  sound?: string;
  badge?: number;
}

/**
 * Send consultation summary to mobile app
 */
export const sendConsultationSummaryToMobile = async (
  appointmentId: number,
  patientId: number,
  doctorName: string,
  summaryData: {
    diagnosis: string;
    treatment: string;
    recommendations: string;
    followUp: string;
    notes: string;
  }
): Promise<void> => {
  try {
    // Format summary for mobile consumption
    const mobilePayload = {
      appointment_id: appointmentId,
      patient_id: patientId,
      doctor_name: doctorName,
      consultation_date: new Date().toISOString(),
      summary: {
        diagnosis: summaryData.diagnosis,
        treatment: summaryData.treatment,
        recommendations: summaryData.recommendations,
        follow_up: summaryData.followUp,
        additional_notes: summaryData.notes
      },
      formatted_text: formatSummaryForMobile(summaryData),
      download_available: true
    };

    // Send to mobile API endpoint
    const response = await fetch(`${API_BASE_URL}/mobile/consultation-summary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(mobilePayload)
    });

    if (!response.ok) {
      throw new Error(`Failed to send to mobile: ${response.status}`);
    }

    console.log('Consultation summary sent to mobile app successfully');
  } catch (error) {
    console.error('Failed to send consultation summary to mobile:', error);
    throw error;
  }
};

/**
 * Send push notification to mobile app
 */
export const sendMobilePushNotification = async (
  notification: MobilePushNotification
): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/mobile/push-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({
        ...notification,
        priority: notification.priority || 'high',
        sound: notification.sound || 'default',
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error(`Push notification failed: ${response.status}`);
    }

    console.log('Push notification sent successfully');
  } catch (error) {
    console.error('Failed to send push notification:', error);
    throw error;
  }
};

/**
 * Format consultation summary for mobile display
 */
export const formatSummaryForMobile = (summaryData: {
  diagnosis: string;
  treatment: string;
  recommendations: string;
  followUp: string;
  notes: string;
}): string => {
  const sections = [];

  if (summaryData.diagnosis.trim()) {
    sections.push(`**DIAGNOSIS:**\n${summaryData.diagnosis.trim()}`);
  }

  if (summaryData.treatment.trim()) {
    sections.push(`**TREATMENT:**\n${summaryData.treatment.trim()}`);
  }

  if (summaryData.recommendations.trim()) {
    sections.push(`**RECOMMENDATIONS:**\n${summaryData.recommendations.trim()}`);
  }

  if (summaryData.followUp.trim()) {
    sections.push(`**FOLLOW-UP:**\n${summaryData.followUp.trim()}`);
  }

  if (summaryData.notes.trim()) {
    sections.push(`**ADDITIONAL NOTES:**\n${summaryData.notes.trim()}`);
  }

  return sections.join('\n\n');
};

/**
 * Get mobile-friendly consultation summaries for a patient
 */
export const getMobileConsultationSummaries = async (
  patientId: number
): Promise<MobileConsultationSummary[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/mobile/patient/${patientId}/consultations`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch mobile consultations: ${response.status}`);
    }

    const data = await response.json();
    return data.consultations || [];
  } catch (error) {
    console.error('Failed to fetch mobile consultation summaries:', error);
    throw error;
  }
};

/**
 * Generate mobile download link for consultation summary
 */
export const generateMobileDownloadLink = async (
  consultationId: number,
  patientId: number
): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/mobile/consultation/${consultationId}/download-link`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ patient_id: patientId })
    });

    if (!response.ok) {
      throw new Error(`Failed to generate download link: ${response.status}`);
    }

    const data = await response.json();
    return data.download_url;
  } catch (error) {
    console.error('Failed to generate mobile download link:', error);
    throw error;
  }
};

/**
 * Register mobile device for push notifications
 */
export const registerMobileDevice = async (
  userId: number,
  deviceToken: string,
  platform: 'ios' | 'android'
): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/mobile/register-device`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: userId,
        device_token: deviceToken,
        platform: platform,
        registered_at: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error(`Device registration failed: ${response.status}`);
    }

    console.log('Mobile device registered successfully');
  } catch (error) {
    console.error('Failed to register mobile device:', error);
    throw error;
  }
};

/**
 * Helper function to get auth token
 */
const getAuthToken = (): string => {
  const session = JSON.parse(localStorage.getItem('session') || '{}');
  return session.token || '';
};

/**
 * Mobile app deep link generator
 */
export const generateMobileDeepLink = (
  action: string,
  params: Record<string, any>
): string => {
  const baseUrl = 'smarthealth://';
  const queryParams = new URLSearchParams(params).toString();
  return `${baseUrl}${action}?${queryParams}`;
};

// Export all mobile utilities
export const MobileAPI = {
  sendConsultationSummaryToMobile,
  sendMobilePushNotification,
  formatSummaryForMobile,
  getMobileConsultationSummaries,
  generateMobileDownloadLink,
  registerMobileDevice,
  generateMobileDeepLink
};

export default MobileAPI;