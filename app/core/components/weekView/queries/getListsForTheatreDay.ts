import { Ctx } from "blitz"
import { endOfDay, startOfDay, parseISO } from "date-fns"
import db from "db"
import * as z from "zod"

export default async function getListsForTheatreDay(
  { theatreId, day }: { theatreId: string; day: string },
  ctx: Ctx
) {
  const lists = await db.theatreList.findMany({
    where: {
      theatreId,
      day,
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
