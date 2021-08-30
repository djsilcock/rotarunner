import { Ctx, resolver } from "blitz"
import { formatISO, isValid, startOfWeek, parseISO } from "date-fns"
import db, { StaffDuty, TheatreList } from "db"
import getListsForWeek from "../queries/getListsForWeek"
import * as z from "zod"
import { refetcher } from "./modifyList"

function numberString() {
  return z.union([
    z.number(),
    z
      .string()
      .refine((input) => !isNaN(parseInt(input)))
      .transform((input) => parseInt(input)),
  ])
}
const TheatreListFetcher = z.object({
  id: numberString(),
})

const StaffDutyModel = z.object({
  id: numberString(),
  staffMemberId: numberString(),
  sessionTypeId: z.string(),
  listId: z.number(),
})

const zodSchema = z.union([
  z.object({
    action: z.literal("modify"),
    duty: z.object({
      id: numberString(),
    }),
    changes: z
      .object({
        staffMemberId: numberString(),
        sessionTypeId: z.string(),
        listId: z.number(),
      })
      .partial(),
  }),
  z.object({
    action: z.literal("delete"),
    duty: z.object({
      id: numberString(),
    }),
  }),
])

function deleteDuty(list: { id: number }) {
  return db.staffDuty.delete({ where: { id: list.id } })
}

function getListForDuty(duty: Partial<StaffDuty>) {
  return (
    duty.listId
      ? Promise.resolve({ listId: duty.listId })
      : db.staffDuty.findUnique({
          where: { id: duty.id },
          rejectOnNotFound: true,
        })
  ).then(({ listId }) =>
    db.theatreList.findUnique({
      where: { id: listId },
      rejectOnNotFound: true,
    })
  )
}

export default resolver.pipe(
  resolver.zod(zodSchema),
  function (input) {
    const refetchQueue = new Array<any>()
    return { refetchQueue, ...input }
  },
  function deleteDutyMaybe(dutyChanges) {
    if (dutyChanges.action != "delete") return dutyChanges
    return db.staffDuty
      .delete({ where: { id: dutyChanges.duty.id } })
      .then(getListForDuty)
      .then(dutyChanges.refetchQueue.push)
      .catch(console.log)
      .then(() => dutyChanges)
  },
  function changeDutyMaybe(dutyChanges) {
    if (dutyChanges.action != "modify") return dutyChanges
    return db.$transaction(async () => {
      console.log(
        await Promise.allSettled([
          getListForDuty(dutyChanges.changes).then((d) => dutyChanges.refetchQueue.push(d)),
          getListForDuty(dutyChanges.duty).then((d) => dutyChanges.refetchQueue.push(d)),
        ])
      )
      await db.staffDuty.update({
        where: { id: dutyChanges.duty.id },
        data: dutyChanges.changes,
      })
      return dutyChanges
    })
  },
  refetcher
)
