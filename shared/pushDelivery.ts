export type PushDeliveryOutcome = { delivered: number; subscriptions: number; failed?: number };

/**
 * A scheduled reminder is only safe to consume after the push provider accepts
 * at least one subscription. A missing/stale subscription must leave it due so
 * the user can repair notification permission and receive it on the next run.
 */
export function shouldConfirmPushDelivery(outcome: PushDeliveryOutcome) {
  return outcome.delivered > 0;
}
