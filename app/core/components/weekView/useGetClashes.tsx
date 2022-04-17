import { useQuery } from "blitz";
import getOtherDutiesToday from "./queries/getOtherDutiesToday";

export function useGetClashes(theatreId: string, day: string, sessionTypes: any) {
  const [allOtherDutiesToday] = useQuery(
    getOtherDutiesToday,
    { theatreId, day },
    { enabled: !!theatreId && !!day, placeholderData: [] }
  );
  const getClashes = (staffMemberId, sessionTypeId) => allOtherDutiesToday
    .map((otherDuty) => {
      const otherSessionTypeId = otherDuty.sessionTypeId || otherDuty.list.sessionTypeId;
      const otherSessionType = sessionTypes.find((s) => s.session.id == otherSessionTypeId);
      if (otherDuty.staffMemberId != staffMemberId)
        return undefined;
      if (otherDuty.list.theatreId == theatreId)
        return undefined;
      if (otherSessionType.overlaps.includes(sessionTypeId))
        return `⚠️Doing ${otherSessionTypeId} in ${otherDuty.list.theatreId}`;
    })

    .filter((a) => a);
  console.log("otherdutiestoday", allOtherDutiesToday, theatreId, day);
  return getClashes;
}
