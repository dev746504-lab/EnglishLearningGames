import { HEIST_RULES } from "./constants";

/** A word missed in a run becomes eligible for Cold Case after this many hours. */
export function coldCaseEligibleAt(missedAt: Date): Date {
  return new Date(missedAt.getTime() + HEIST_RULES.coldCaseRequeueHours * 60 * 60 * 1000);
}

export function isColdCaseEligible(missedAt: Date, now: Date = new Date()): boolean {
  return now.getTime() >= coldCaseEligibleAt(missedAt).getTime();
}
