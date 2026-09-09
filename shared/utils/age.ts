/**
 * Calculate age from an ISO date string "YYYY-MM-DD"
 */
export function calcAge(dateOfBirth: string): number {
  const today = new Date();
  const dob   = new Date(dateOfBirth);
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

/**
 * Format height from cm to a readable string e.g. "5'9\" (175 cm)"
 */
export function formatHeight(cm: number): string {
  const totalInches = cm / 2.54;
  const feet   = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return `${feet}'${inches}" (${cm} cm)`;
}
