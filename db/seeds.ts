import db from "./index"

/*
 * This seed function is executed when you run `blitz db seed`.
 *
 * Probably you want to use a library like https://chancejs.com
 * or https://github.com/Marak/Faker.js to easily generate
 * realistic data.
 */
const seed = async () => {
  // for (let i = 0; i < 5; i++) {
  //   await db.project.create({ data: { name: "Project " + i } })
  // }
  await Promise.all(
    [
      { id: "Emg", name: "Emergencies" },
      { id: "Th1", name: "Theatre 1" },
    ].map((data) => db.theatre.create({ data }).catch((e) => null))
  )

  await Promise.all(
    [
      { id: "ENT", name: "ENT", surgeons: [{}] },
      { id: "GS", name: "General Surgery" },
    ].map((data) => db.specialty.create({ data }).catch((e) => null))
  )

  await Promise.all(
    [
      { id: "am", name: "morning", startTime: 8, finishTime: 13 },
      { id: "pm", name: "afternoon", startTime: 13, finishTime: 18 },
      { id: "day", name: "all day", startTime: 8, finishTime: 18 },
      { id: "eve", name: "evening", startTime: 18, finishTime: 21 },
      { id: "ld", name: "long day", startTime: 8, finishTime: 20 },
      { id: "oc", name: "on-call", startTime: 18, finishTime: 32 },
      { id: "ns", name: "night", startTime: 20, finishTime: 32 },
    ].map((data) => db.sessionType.create({ data }).catch((e) => null))
  )

  await Promise.all(
    [
      {
        id: 1,
        firstName: "Fred",
        lastName: "Bloggs",
      },
      {
        id: 2,
        firstName: "John",
        lastName: "Smith",
      },
    ].map((data) => db.staffMember.create({ data }).catch((e) => null))
  )

  await Promise.all(
    [
      {
        day: new Date().toISOString().slice(0, 10),
        theatreId: "Emg",
        sessionTypeId: "am",
      },
    ].map((i) => db.theatreList.create({ data: i }))
  )
}

export default seed
