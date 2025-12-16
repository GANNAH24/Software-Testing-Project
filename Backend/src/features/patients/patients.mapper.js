// src/features/patients/patients.mapper.js
const mapPatientUpdatesToDb = (updates = {}) => {
  const dbUpdates = {};

  if (updates.dateOfBirth !== undefined) {
    dbUpdates.date_of_birth = updates.dateOfBirth;
  }

  if (updates.phone !== undefined) {
    dbUpdates.phone = updates.phone;
  }

  if (updates.gender !== undefined) {
    dbUpdates.gender = updates.gender;
  }

  return dbUpdates;
};

module.exports = { mapPatientUpdatesToDb };
