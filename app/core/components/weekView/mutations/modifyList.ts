import { Ctx, resolver } from "blitz"
import { formatISO, isValid, startOfWeek, parseISO } from "date-fns"
import db, { StaffDuty, TheatreList } from "db"
import getListsForWeek from "../queries/getListsForWeek"
import * as z from "zod"
import { numberString as blankableNumberString } from "../numberString"

const numberString = () => blankableNumberString().refine((v) => typeof v != "undefined")


const TheatreListFetcher = z.object({
  id: numberString(),
})

const TheatreListModel = z.object({
  day: z.string().refine((input) => isValid(parseISO(input))),
  theatreId: z.string(),
  surgeonId: numberString().nullable().default(null),
  specialtyId: z.string().nullable().default(null),
  sessionTypeId: z.string(),
  duties: z.array(
    z.object({
      staffMemberId: numberString(),
      sessionTypeId: z.string().optional(),
    })
  ).optional(),
})

const zodSchema = z.union([

  z.object({
    list: TheatreListFetcher,
    action: z.literal("modify"),
    changes: TheatreListModel.partial(),
  }),
  z.object({
    action: z.literal("create"),
    list:TheatreListModel
  }),
  z.object({
    list: TheatreListFetcher,
    action: z.literal("delete"),
  }),
  z.object({
    list: TheatreListFetcher,
    action: z.literal("clone"),
  }),
])

type ListChanges = z.infer<typeof zodSchema>

async function getFullList(list: z.infer<typeof TheatreListFetcher>) {
  const originalList = await db.theatreList.findUnique({
    where: { id: list.id },
    include: { duties: true },
    rejectOnNotFound: true,
  })
  return originalList
}
export function refetcher(listChanges, ctx) {
  const weeksToRefetch = new Set()
  console.log(listChanges.refetchQueue)
  listChanges.refetchQueue.forEach((record) => {
    weeksToRefetch.add(
      formatISO(startOfWeek(parseISO(record.day), { weekStartsOn: 1 })).slice(0, 10)
    )
  })

  return Promise.all(
    Array.from(weeksToRefetch.values(), (wk: string) =>
      getListsForWeek({ day: wk }, ctx).then((result) => ({
        vars: { day: wk },
        result,
      }))
    )
  )
}
export default resolver.pipe(
  resolver.zod(zodSchema),
  (input) => {
    const refetchQueue = new Array<any>()
    return { refetchQueue, ...input }
  },
  async function deleteListMaybe(listChanges) {
    if (listChanges.action != "delete") return listChanges
    listChanges.refetchQueue.push(
      await db.theatreList.delete({ where: { id: listChanges.list.id } })
    )
    return listChanges
  },
  async function cloneListMaybe(listChanges) {
    if (listChanges.action != "clone") return listChanges
    listChanges.refetchQueue.push(
      await getFullList(listChanges.list).then(({ id, duties, ...data }) =>
        db.theatreList.create({
          data: {
            duties: {
              create: duties.map(({ id, listId, ...rest }) => rest),
            },
            ...data,
          },
        })
      )
    )
    return listChanges
  },
  async function createListMaybe(listChanges) {
    if (listChanges.action != "create") return listChanges
    const list=Promise.resolve(listChanges.list).then(({ duties, ...data }) =>
        db.theatreList.create({
          data
          }
        )
      )

    return { ...listChanges, action: 'modify', list:await list, changes: { duties:listChanges.list.duties } }
   },

  function modifyListMaybe(listChanges) {
    if (listChanges.action != "modify") return listChanges
    return db.$transaction(async () => {
      const { changes } = listChanges
      const list = await getFullList(listChanges.list)
      listChanges.refetchQueue.push(list)
      if (changes.duties) {
        const oldStaff = new Map(list.duties.map((d) => [d.staffMemberId, d.sessionTypeId]))
        const newStaff = new Map(changes.duties.map((d) => [d.staffMemberId, d.sessionTypeId]))
        const staffToAdd = new Map(newStaff)
        const staffToRemove = new Map()
        oldStaff.forEach((v, k) => {
          console.log(v, k)
          if (newStaff.get(k) != v) {
              staffToRemove.set(k, v)  //is different or missing,so delete old version
            }
            else{
              //is same, so don't add again
              staffToAdd.delete(k)
            }
        })
        console.log("old/new", oldStaff, newStaff)
        console.log("add/del", staffToAdd, staffToRemove)
        //would think that Array.concat would work here but it throws a TS error, for some reason
        await Promise.all([
          Promise.all(
            Array.from(staffToRemove.keys(), (staffMemberId) =>
              db.staffDuty.deleteMany({
                where: {
                  listId: list.id,
                  staffMemberId,
                },
              })
            )
          ),
          Promise.all(
            Array.from(staffToAdd.entries(), ([staffMemberId,sessionTypeId]:[staffMemberId:number, sessionTypeId:string]) =>
              db.staffDuty.create({
                data: {
                  listId: list.id,
                  sessionTypeId,
                  staffMemberId,
                },
              })
            )
          ),
        ])
      }
      listChanges.refetchQueue.push(
        await db.theatreList.update({
          where: { id: list.id },
          data: (({ duties, ...rest }) => rest)(changes),
        })
      )
      return listChanges
    })
  },
  refetcher
)
