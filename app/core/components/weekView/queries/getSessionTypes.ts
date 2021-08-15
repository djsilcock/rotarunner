import { Ctx } from "blitz"
import db from "db"
import * as z from "zod"

export default async function getSessionTypes(vars, ctx) {
  const theatres = await db.sessionType.findMany()
  console.log(theatres)
  return theatres
}
