import { Ctx } from "blitz"
import db from "db"
import * as z from "zod"

export default async function getStaff(vars, ctx) {
  const staff = await db.staffMember.findMany()
  return staff
}
