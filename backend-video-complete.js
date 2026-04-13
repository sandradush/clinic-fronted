// Complete Backend Implementation for Video Calling
// File: server.js or app.js

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'clinic_db'
};

// Agora configuration
const AGORA_APP_ID = process.env.AGORA_APP_ID;
const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;

// Database helper
async function executeQuery(query, params = []) {
  const connection = await mysql.createConnection(dbConfig);
  try {
    const [results] = await connection.execute(query, params);
    return results;
  } finally {
    await connection.end();
  }
}

// ==================== VIDEO CALLING ENDPOINTS ====================

// 1. CREATE/JOIN VIDEO SESSION
app.post('/api/video/sessions', async (req, res) => {
  try {
    const { appointment_id, doctor_id, patient_id, user_id } = req.body;
    
    console.log('Creating video session:', { appointment_id, doctor_id, patient_id, user_id });
    
    if (!appointment_id || !user_id) {
      return res.status(400).json({ error: 'Missing required fields: appointment_id, user_id' });
    }

    // Generate unique channel name
    const channelName = `appointment_${appointment_id}_${Date.now()}`;
    
    // Generate Agora token
    const uid = parseInt(user_id);
    const role = RtcRole.PUBLISHER;
    const expirationTimeInSeconds = 3600; // 1 hour
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
    
    const token = RtcTokenBuilder.buildTokenWithUid(
      AGORA_APP_ID, 
      AGORA_APP_CERTIFICATE, 
      channelName, 
      uid, 
      role, 
      privilegeExpiredTs
    );
    
    // Check if session already exists
    const existingSession = await executeQuery(
      'SELECT * FROM video_calls WHERE appointment_id = ? AND status IN ("scheduled", "active")',
      [appointment_id]
    );
    
    let session;
    
    if (existingSession.length === 0) {
      // Create new session
      const result = await executeQuery(
        `INSERT INTO video_calls (appointment_id, doctor_id, patient_id, channel_name, status, created_at) 
         VALUES (?, ?, ?, ?, 'scheduled', NOW())`,
        [appointment_id, doctor_id, patient_id, channelName]
      );
      
      session = {
        id: result.insertId,
        appointment_id,
        doctor_id,
        patient_id,
        channel_name: channelName,
        agora_token: token,
        agora_app_id: AGORA_APP_ID,
        status: 'scheduled',
        expires_at: new Date(privilegeExpiredTs * 1000).toISOString()
      };
    } else {
      // Generate new token for existing session
      const existingChannelName = existingSession[0].channel_name;
      const newToken = RtcTokenBuilder.buildTokenWithUid(
        AGORA_APP_ID, 
        AGORA_APP_CERTIFICATE, 
        existingChannelName, 
        uid, 
        role, 
        privilegeExpiredTs
      );
      
      session = {
        ...existingSession[0],
        agora_token: newToken,
        agora_app_id: AGORA_APP_ID,
        expires_at: new Date(privilegeExpiredTs * 1000).toISOString()
      };
    }
    
    console.log('Video session created:', session);
    res.json(session);
  } catch (error) {
    console.error('Error creating video session:', error);
    res.status(500).json({ error: 'Failed to create video session', details: error.message });
  }
});

// 2. JOIN VIDEO SESSION
app.put('/api/video/sessions/:id/join', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, user_type } = req.body;
    
    console.log('User joining session:', { id, user_id, user_type });
    
    // Check if session exists
    const session = await executeQuery('SELECT * FROM video_calls WHERE id = ?', [id]);
    if (session.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Check if this is the first participant
    const participants = await executeQuery(
      'SELECT COUNT(*) as count FROM video_call_participants WHERE call_id = ? AND left_at IS NULL',
      [id]
    );
    
    if (participants[0].count === 0) {
      // First participant - mark session as active
      await executeQuery(
        'UPDATE video_calls SET status = "active", started_at = NOW() WHERE id = ?',
        [id]
      );
    }
    
    // Log participant join (prevent duplicates)
    await executeQuery(
      `INSERT INTO video_call_participants (call_id, user_id, user_type, joined_at) 
       VALUES (?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE joined_at = NOW(), left_at = NULL`,
      [id, user_id, user_type]
    );
    
    res.json({ 
      message: 'Joined video session successfully',
      session_status: participants[0].count === 0 ? 'active' : 'ongoing'
    });
  } catch (error) {
    console.error('Error joining video session:', error);
    res.status(500).json({ error: 'Failed to join video session', details: error.message });
  }
});

// 3. END VIDEO SESSION
app.put('/api/video/sessions/:id/end', async (req, res) => {
  try {
    const { id } = req.params;
    const { ended_by, duration } = req.body;
    
    console.log('Ending video session:', { id, ended_by, duration });
    
    // Update session status
    await executeQuery(
      `UPDATE video_calls 
       SET status = 'ended', ended_at = NOW(), duration = ?, ended_by = ?
       WHERE id = ?`,
      [duration || 0, ended_by, id]
    );
    
    // Update participant left time
    await executeQuery(
      `UPDATE video_call_participants 
       SET left_at = NOW() 
       WHERE call_id = ? AND user_id = ? AND left_at IS NULL`,
      [id, ended_by]
    );
    
    res.json({ message: 'Video session ended successfully' });
  } catch (error) {
    console.error('Error ending video session:', error);
    res.status(500).json({ error: 'Failed to end video session', details: error.message });
  }
});

// 4. GET SESSION STATUS
app.get('/api/video/sessions/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    
    const session = await executeQuery(
      `SELECT vc.*, 
              COUNT(vcp.id) as participant_count,
              GROUP_CONCAT(CONCAT(vcp.user_type, ':', vcp.user_id)) as participants
       FROM video_calls vc
       LEFT JOIN video_call_participants vcp ON vc.id = vcp.call_id AND vcp.left_at IS NULL
       WHERE vc.id = ?
       GROUP BY vc.id`,
      [id]
    );
    
    if (session.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    res.json(session[0]);
  } catch (error) {
    console.error('Error getting session status:', error);
    res.status(500).json({ error: 'Failed to get session status', details: error.message });
  }
});

// 5. REFRESH TOKEN
app.post('/api/video/token/refresh', async (req, res) => {
  try {
    const { channel_name, user_id } = req.body;
    
    if (!channel_name || !user_id) {
      return res.status(400).json({ error: 'Missing channel_name or user_id' });
    }
    
    const uid = parseInt(user_id);
    const role = RtcRole.PUBLISHER;
    const expirationTimeInSeconds = 3600; // 1 hour
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
    
    const token = RtcTokenBuilder.buildTokenWithUid(
      AGORA_APP_ID, 
      AGORA_APP_CERTIFICATE, 
      channel_name, 
      uid, 
      role, 
      privilegeExpiredTs
    );
    
    res.json({
      token,
      expires_at: new Date(privilegeExpiredTs * 1000).toISOString()
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).json({ error: 'Failed to refresh token', details: error.message });
  }
});

// 6. GET APPOINTMENT WITH VIDEO SESSION INFO
app.get('/api/appointments/:id/video', async (req, res) => {
  try {
    const { id } = req.params;
    
    const appointment = await executeQuery(
      `SELECT a.*, 
              CONCAT(p.first_name, ' ', p.last_name) as patient_name,
              CONCAT(d.first_name, ' ', d.last_name) as doctor_name,
              p.phone as patient_phone,
              p.email as patient_email,
              d.phone as doctor_phone,
              vc.id as video_session_id,
              vc.channel_name,
              vc.status as video_status
       FROM appointments a
       JOIN users p ON a.patient_id = p.id
       LEFT JOIN users d ON a.doctor_id = d.id
       LEFT JOIN video_calls vc ON a.id = vc.appointment_id AND vc.status IN ('scheduled', 'active')
       WHERE a.id = ?`,
      [id]
    );
    
    if (appointment.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    res.json(appointment[0]);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({ error: 'Failed to fetch appointment', details: error.message });
  }
});

// 7. SAVE CALL NOTES
app.post('/api/appointments/:id/notes', async (req, res) => {
  try {
    const { id } = req.params;
    const { notes, created_by } = req.body;
    
    await executeQuery(
      `INSERT INTO appointment_notes (appointment_id, notes, created_by, created_at)
       VALUES (?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE notes = VALUES(notes), updated_at = NOW()`,
      [id, notes, created_by]
    );
    
    res.json({ message: 'Notes saved successfully' });
  } catch (error) {
    console.error('Error saving notes:', error);
    res.status(500).json({ error: 'Failed to save notes', details: error.message });
  }
});

// 8. GET USER'S VIDEO CALL HISTORY
app.get('/api/users/:id/video-calls', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 10, offset = 0 } = req.query;
    
    const calls = await executeQuery(
      `SELECT vc.*, 
              a.date as appointment_date,
              a.time as appointment_time,
              CONCAT(p.first_name, ' ', p.last_name) as patient_name,
              CONCAT(d.first_name, ' ', d.last_name) as doctor_name
       FROM video_calls vc
       JOIN appointments a ON vc.appointment_id = a.id
       JOIN users p ON vc.patient_id = p.id
       LEFT JOIN users d ON vc.doctor_id = d.id
       WHERE vc.patient_id = ? OR vc.doctor_id = ?
       ORDER BY vc.created_at DESC
       LIMIT ? OFFSET ?`,
      [id, id, parseInt(limit), parseInt(offset)]
    );
    
    res.json(calls);
  } catch (error) {
    console.error('Error fetching video call history:', error);
    res.status(500).json({ error: 'Failed to fetch video call history', details: error.message });
  }
});

// 9. UPDATE USER DEVICE INFO (for mobile optimization)
app.put('/api/users/:id/device', async (req, res) => {
  try {
    const { id } = req.params;
    const { mobile_token, device_type } = req.body;
    
    await executeQuery(
      'UPDATE users SET mobile_token = ?, device_type = ?, last_active = NOW() WHERE id = ?',
      [mobile_token, device_type, id]
    );
    
    res.json({ message: 'Device info updated successfully' });
  } catch (error) {
    console.error('Error updating device info:', error);
    res.status(500).json({ error: 'Failed to update device info', details: error.message });
  }
});

// 10. HEALTH CHECK ENDPOINT
app.get('/api/video/health', (req, res) => {
  res.json({
    status: 'healthy',
    agora_configured: !!(AGORA_APP_ID && AGORA_APP_CERTIFICATE),
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error', 
    details: process.env.NODE_ENV === 'development' ? error.message : undefined 
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Agora App ID: ${AGORA_APP_ID ? 'Configured' : 'Not configured'}`);
  console.log(`Agora Certificate: ${AGORA_APP_CERTIFICATE ? 'Configured' : 'Not configured'}`);
});

module.exports = app;