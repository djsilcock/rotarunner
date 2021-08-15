export default function setTimeValues(origdate, newvalues = {}) {
  const date = origdate instanceof Date ? origdate : new Date(origdate)
  Object.entries(newvalues).forEach(([k, v]) => {
    switch (k) {
      case "hour":
        date.setHours(v)
        break
      case "minute":
        date.setMinutes(v)
        break
      case "second":
        date.setSeconds(v)
        break
      case "ms":
        date.setMilliseconds(v)
        break
      default:
        console.warn("unknown time value " + k)
    }
  })
  return date
}
