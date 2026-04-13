// Backend Endpoints for Agora.io Video Calling System
// File: routes/videoRoutes.js

const express = require('express');
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
const router = express.Router();

// Environment variables needed
const AGORA_APP_ID = process.env.AGORA_APP_ID;
const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;

// 1. CREATE/JOIN VIDEO SESSION
// POST /api/video/sessions
router.post('/sessions', async (req, res) => {
  try {
    const { appointment_id, doctor_id, patient_id, user_id } = req.body;
    
    // Validate required fields
    if (!appointment_id || !user_id) {
      return res.status(400).json({ error: 'Missing required fields' });
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
    const existingSession = await db.query(
      'SELECT * FROM video_calls WHERE appointment_id = ? AND status IN ("scheduled", "active")',
      [appointment_id]
    );
    
    let session;
    
    if (existingSession.length === 0) {
      // Create new session
      const result = await db.query(
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
    
    res.json(session);
  } catch (error) {
    console.error('Error creating video session:', error);
    res.status(500).json({ error: 'Failed to create video session' });
  }
});

// 2. JOIN VIDEO SESSION
// PUT /api/video/sessions/:id/join
router.put('/sessions/:id/join', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, user_type } = req.body;
    
    // Update session status to active when first participant joins
    const session = await db.query('SELECT * FROM video_calls WHERE id = ?', [id]);
    if (session.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Check if this is the first participant
    const participants = await db.query(
      'SELECT COUNT(*) as count FROM video_call_participants WHERE call_id = ?',
      [id]
    );
    
    if (participants[0].count === 0) {
      // First participant - mark session as active
      await db.query(
        'UPDATE video_calls SET status = "active", started_at = NOW() WHERE id = ?',
        [id]
      );
    }
    
    // Log participant join (prevent duplicates)
    await db.query(
      `INSERT IGNORE INTO video_call_participants (call_id, user_id, user_type, joined_at) 
       VALUES (?, ?, ?, NOW())`,
      [id, user_id, user_type]
    );
    
    res.json({ 
      message: 'Joined video session successfully',
      session_status: participants[0].count === 0 ? 'active' : 'ongoing'
    });
  } catch (error) {
    console.error('Error joining video session:', error);
    res.status(500).json({ error: 'Failed to join video session' });
  }
});

// 3. END VIDEO SESSION
// PUT /api/video/sessions/:id/end
router.put('/sessions/:id/end', async (req, res) => {
  try {
    const { id } = req.params;
    const { ended_by, duration } = req.body;
    
    // Update session status
    await db.query(
      `UPDATE video_calls 
       SET status = 'ended', ended_at = NOW(), duration = ?, ended_by = ?
       WHERE id = ?`,
      [duration || 0, ended_by, id]
    );
    
    // Update participant left time
    await db.query(
      `UPDATE video_call_participants 
       SET left_at = NOW() 
       WHERE call_id = ? AND user_id = ? AND left_at IS NULL`,
      [id, ended_by]
    );
    
    res.json({ message: 'Video session ended successfully' });
  } catch (error) {
    console.error('Error ending video session:', error);
    res.status(500).json({ error: 'Failed to end video session' });
  }
});

// 4. GET SESSION STATUS
// GET /api/video/sessions/:id/status
router.get('/sessions/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    
    const session = await db.query(
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
    res.status(500).json({ error: 'Failed to get session status' });
  }
});

// 5. GENERATE NEW TOKEN (for token refresh)
// POST /api/video/token/refresh
router.post('/token/refresh', async (req, res) => {
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
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

// 6. GET APPOINTMENT WITH VIDEO SESSION
// GET /api/appointments/:id/video
router.get('/appointments/:id/video', async (req, res) => {
  try {
    const { id } = req.params;
    
    const appointment = await db.query(
      `SELECT a.*, 
              CONCAT(p.first_name, ' ', p.last_name) as patient_name,
              CONCAT(d.first_name, ' ', d.last_name) as doctor_name,
              p.phone as patient_phone,
              p.email as patient_email,
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
    res.status(500).json({ error: 'Failed to fetch appointment' });
  }
});

// 7. SAVE CALL NOTES
// POST /api/appointments/:id/notes
router.post('/appointments/:id/notes', async (req, res) => {
  try {
    const { id } = req.params;
    const { notes, created_by } = req.body;
    
    await db.query(
      `INSERT INTO appointment_notes (appointment_id, notes, created_by, created_at)
       VALUES (?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE notes = VALUES(notes), updated_at = NOW()`,
      [id, notes, created_by]
    );
    
    res.json({ message: 'Notes saved successfully' });
  } catch (error) {
    console.error('Error saving notes:', error);
    res.status(500).json({ error: 'Failed to save notes' });
  }
});

module.exports = router;

// Usage in main app.js:
// const videoRoutes = require('./routes/videoRoutes');
// app.use('/api/video', videoRoutes);