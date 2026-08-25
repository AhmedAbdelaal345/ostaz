export const rewardCatalog = {
  next_subscription_discount: { points: 100, labelAr: "خصم على اشتراك الشهر القادم", labelEn: "Next-month subscription discount" },
  free_booklet: { points: 150, labelAr: "ملزمة مجانية", labelEn: "Free booklet" },
  gift: { points: 200, labelAr: "هدية عينية", labelEn: "Physical gift" },
  app_subscription_discount: { points: 80, labelAr: "خصم على اشتراك التطبيق", labelEn: "App subscription discount" },
} as const;

export type RewardType = keyof typeof rewardCatalog;
export const rewardTypes = Object.keys(rewardCatalog) as RewardType[];

export function rewardPointsCost(type: RewardType) {
  return rewardCatalog[type].points;
}

export function requiresStudentSubscriptionCredit(type: RewardType) {
  return type === "next_subscription_discount";
}
