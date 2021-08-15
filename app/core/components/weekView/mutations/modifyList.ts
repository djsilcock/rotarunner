import { Ctx } from "blitz"
import { formatISO, startOfWeek } from "date-fns"
import parseISO from "date-fns/parseISO"
import db, { TheatreList } from "db"
import getListsForWeek from "../queries/getListsForWeek"

interface ModifyList {
  list: TheatreList
  changes: Partial<TheatreList> | "delete" | "clone"
}
export default async function modifyList({ list, changes }: ModifyList, ctx: Ctx) {
  const weeksToRefetch = new Set()
  const addWeek = (record) => {
    weeksToRefetch.add(
      formatISO(startOfWeek(parseISO(record.day), { weekStartsOn: 1 })).slice(0, 10)
    )
  }
  addWeek(await db.theatreList.findUnique({ where: { id: list.id } }))
  switch (changes) {
    case "delete":
      {
        addWeek(
          await db.theatreList.delete({
            where: {
              id: list.id,
            },
          })
        )
      }
      break
    case "clone":
      await db.theatreList
        .findUnique({ where: { id: list.id }, rejectOnNotFound: true })
        .then(({ id, ...data }) => db.theatreList.create({ data }))
      break
    default:
      addWeek(
        await db.theatreList.update({
          where: { id: list.id },
          data: changes,
        })
      )
  }
  return Promise.all(
    Array.from(weeksToRefetch.values(), (wk: string) =>
      getListsForWeek({ day: wk }, ctx).then((result) => ({
        vars: { day: wk },
        result,
      }))
    )
  )
}
