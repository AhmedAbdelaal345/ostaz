export function formatRemainingLessonTime(totalMinutes: number, language: "ar" | "en" = "ar"): string {
  const minutes = Math.max(0, Math.ceil(totalMinutes));
  const days = Math.floor(minutes / (24 * 60));
  const hours = Math.floor((minutes % (24 * 60)) / 60);
  const remainderMinutes = minutes % 60;

  if (language === "en") {
    const parts: string[] = [];
    if (days) parts.push(`${days} ${days === 1 ? "day" : "days"}`);
    if (hours) parts.push(`${hours} ${hours === 1 ? "hour" : "hours"}`);
    if (remainderMinutes || !parts.length) parts.push(`${remainderMinutes} ${remainderMinutes === 1 ? "minute" : "minutes"}`);
    return parts.join(" ");
  }

  if (days > 0) {
    const dayText = days === 1 ? "يوم واحد" : days === 2 ? "يومان" : `${days} أيام`;
    const parts = [dayText];
    if (hours > 0) parts.push(`${hours} ساعة`);
    if (remainderMinutes > 0) parts.push(`${remainderMinutes} دقيقة`);
    return parts.join(" و");
  }

  if (hours > 0) {
    return remainderMinutes > 0 ? `${hours} ساعة و${remainderMinutes} دقيقة` : `${hours} ساعة`;
  }

  return `${remainderMinutes} د`;
}
