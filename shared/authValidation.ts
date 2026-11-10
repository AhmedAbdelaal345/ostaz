const arabicDigits = "٠١٢٣٤٥٦٧٨٩";

export function isValidAuthPhone(value: string) {
  const phone = value.trim();
  if (phone.length < 7 || phone.length > 32) return false;

  const digitCount = phone
    .replace(/[٠-٩]/g, digit => String(arabicDigits.indexOf(digit)))
    .replace(/\D/g, "").length;

  return digitCount >= 7 && digitCount <= 32;
}

export function isValidAuthPassword(value: string) {
  return value.length >= 8 && value.length <= 128;
}

export function isValidRegistrationName(value: string) {
  const name = value.trim();
  return name.length >= 2 && name.length <= 160;
}

export function isValidRegistrationSubject(value: string) {
  const subject = value.trim();
  return subject.length >= 2 && subject.length <= 120;
}
