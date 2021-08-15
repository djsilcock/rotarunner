import db from "db"

export default function getSurgeonsAndSpecialties(vars: {}, ctx) {
  return db.specialty.findMany({ include: { surgeons: true } })
}
