import { Ctx, resolver } from "blitz"
import db, { SessionType } from "db"
import * as z from "zod"
import { numberString } from "../numberString"
import {parseISO,isValid} from 'date-fns'

const zodSchema = z.object({
  day: z.string().refine((input) => isValid(parseISO(input))),
  theatreId: z.string()
}).partial()


interface SessionTypesQuery extends SessionType {
  disabled?: boolean
  warning?: string
}

export default resolver.pipe(resolver.zod(zodSchema),
  function getDutiesToday(vars) {
    return db.staffDuty.findMany(
      {
        where: {
          list: {
            day: vars.day,
            //theatreId:{not:vars.theatreId}
          }
        },
        include: {
          list: true
        }
      }
    ).then(s => { console.log(s);return s})

    //TODO: refine to only look for available staff



  })

