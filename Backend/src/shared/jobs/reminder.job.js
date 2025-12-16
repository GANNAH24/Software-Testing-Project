const cron = require('node-cron');
const logger = require('../utils/logger.util');
const { computeReminderWindows } = require('../utils/reminder.util');
const appointmentsRepository = require('../../features/appointments/appointments.repository');
const PatientsRepository = require('../../features/patients/patients.repository');
const { sendEmail } = require('../utils/mailer.util');

async function processDue(type, start, end) {
  const startISO = start.toISOString();
  const endISO = end.toISOString();
  const due = await appointmentsRepository.findDueReminders(startISO, endISO, type);

  for (const appt of due) {
    try {
      // Fetch patient to get email (best-effort)
      let patientEmail = null;
      try {
        const patient = await PatientsRepository.getPatientById(appt.patient_id);
        patientEmail = patient?.email || patient?.contact_email || null;
      } catch (e) {
        logger.warn('Could not fetch patient email for reminder', { patient_id: appt.patient_id });
      }

      const apptTime = new Date(appt.date);
      const subject = type === '24h'
        ? 'Appointment Reminder: Tomorrow'
        : 'Appointment Reminder: In 2 Hours';

      const text = `Hello,
This is a reminder for your appointment scheduled on ${apptTime.toLocaleString()}.
Doctor ID: ${appt.doctor_id}
Reason: ${appt.reason || 'N/A'}

If you need to cancel or reschedule, please visit your portal.
`;

      await sendEmail({ to: patientEmail, subject, text });
      await appointmentsRepository.markReminderSent(appt.appointment_id, type);
      logger.info('Reminder sent', { appointmentId: appt.appointment_id, type });
    } catch (err) {
      logger.error('Failed to send reminder', { appointmentId: appt.appointment_id, type, error: err.message });
    }
  }
}

function startReminderScheduler() {
  logger.info('Starting reminder scheduler (runs every 15 minutes)');
  // Every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    try {
      const now = new Date();
      const { target24h, target2h } = computeReminderWindows(now, 15);

      await processDue('24h', target24h.start, target24h.end);
      await processDue('2h', target2h.start, target2h.end);
    } catch (err) {
      logger.error('Reminder job cycle failed', { error: err.message });
    }
  }, { scheduled: true });
}

module.exports = { startReminderScheduler };
