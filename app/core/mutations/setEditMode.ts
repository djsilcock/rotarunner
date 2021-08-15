import { Ctx } from "blitz"

interface SwitchBranch {
  branch: string
}

export default async function switchBranch({ branch }, ctx: Ctx) {
  // Require user to be logged in
  //ctx.session.$authorize()

  ctx.session.$setPublicData({ branch })
  return { branch }
}
