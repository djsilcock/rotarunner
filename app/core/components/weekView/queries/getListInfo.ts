import { Ctx } from "blitz"
import { endOfDay, startOfDay } from "date-fns"
import db from "db"
import * as z from "zod"

export default async function getListInfo({ id }: { id: number }, ctx: Ctx) {
  const list = await db.theatreList.findUnique({
    where: {
      id,
    },
    include: { duties: true },
  })
  return list
}
