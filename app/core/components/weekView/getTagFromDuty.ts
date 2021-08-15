import { DutyProps } from "./types"

export function getTagFromDuty(duty: Partial<DutyProps>): string {
  try {
    return `${new Date(duty.dutyDay).toDateString()}-${duty.location}`
  } catch {
    console.warn("cannot get tag from", duty)
    return `${new Date().toDateString()}-EmgTh`
  }
}
