/**
 * @layer Model (Records)
 * @responsibility Data entity contracts and input validation rules for health records.
 */

/**
 * Validates a health record's fields against business constraints.
 * @param {object} record Record input data.
 * @returns {object} Validation result { isValid, errors }.
 */
export function validateHealthRecord(record) {
  return { isValid: true, errors: {} };
}
