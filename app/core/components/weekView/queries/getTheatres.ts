import { Ctx } from "blitz"
import db from "db"
import * as z from "zod"

export default async function getTheatres(vars, ctx) {
  const theatres = await db.theatre.findMany()

  return theatres.map((th) => [th.id, th.name])
}
