import { Ctx, resolver } from "blitz"
import db, { SessionType } from "db"
import * as z from "zod"
import { numberString } from "../numberString"


interface SessionTypesQuery extends SessionType {
  disabled?: boolean
  warning?: string
}

export default function getSessionTypes(vars:{}) {
  return db.sessionType.findMany().then(
      (sessions) => (sessions.map(s1 => ({
        session: s1,
        contains: sessions.filter(
          s2 => (s1.startTime <= s2.startTime && s1.finishTime >= s2.finishTime)
        ).map(s => s.id),
        overlaps: sessions.filter(
          s2 => (s1.startTime < s2.finishTime && s1.finishTime > s2.startTime)
        ).map(s => s.id)
      }))))

    }

