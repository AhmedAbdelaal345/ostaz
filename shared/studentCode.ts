const arabicDigits = "٠١٢٣٤٥٦٧٨٩";

export function normalizeStudentCode(value: string) {
  return value.replace(/[٠-٩]/g, digit => String(arabicDigits.indexOf(digit))).replace(/\D/g, "").slice(0, 4);
}

export function generateStudentCode() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export function isFourDigitStudentCode(value: string | null | undefined) {
  return /^\d{4}$/.test(value || "");
}

export function displayStudentCode(value: string | null | undefined, id: number) {
  const normalized = normalizeStudentCode(value || "");
  return isFourDigitStudentCode(normalized) ? normalized : String(id % 10_000).padStart(4, "0");
}
