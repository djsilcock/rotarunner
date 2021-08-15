import { Ctx } from "blitz"
import { endOfWeek, startOfWeek, addDays, parseISO, formatISO } from "date-fns"
import db from "db"
import * as z from "zod"

export default async function getListsForWeek({ day }: { day: string }, ctx: Ctx) {
  const start = parseISO(day)
  const end = addDays(start, 6)
  const lists = await db.theatreList.findMany({
    where: {
      day: {
        gte: formatISO(start).slice(0, 10),
        lte: formatISO(end).slice(0, 10),
      },
    },
    include: {
      duties: true,
      sessionType: true,
      surgeon: true,
      specialty: true,
    },
  })
  return lists
}
