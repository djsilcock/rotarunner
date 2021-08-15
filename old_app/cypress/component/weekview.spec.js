/* eslint-env mocha */
/* global cy */
import React from "react"
import { mount, unmount } from "@cypress/react"
import { action, observable } from "mobx"
import WeekView from "../../components/weekView"

const theatreNames = [
  { shortName: "EmgTh", theatreName: "Emergency Theatre" },
  { shortName: "ICU", theatreName: "ICU" },
  { shortName: "Th1", theatreName: "Theatre 1" },
]

const makeAllDuties = () =>
  observable([
    {
      id: 0,
      location: "EmgTh",
      startTime: new Date(2021, 2, 3, 8),
      finishTime: new Date(2021, 2, 3, 18),
      staffName: "Joe Bloggs",
      staffLevel: "ST5",
      staffGroup: "higher",
    },
    {
      id: 1,
      location: "EmgTh",
      startTime: new Date(2021, 2, 4, 13),
      finishTime: new Date(2021, 2, 4, 18),
      staffName: "Fred Bloggs",
      staffLevel: "CT1",
      staffGroup: "core",
    },
  ])
it("should change when observable changes", () => {
  const allDuties = makeAllDuties()

  mount(
    <WeekView allDuties={allDuties} viewDate={new Date(2021, 2, 4)} theatreNames={theatreNames} />
  )
  cy.window().then((win) => {
    win.__changeObservable = action(() => {
      allDuties[1].location = "ICU"
    })
  })
  cy.contains("Emergency").parents("tr").contains("Fred Bloggs").should("exist")
  cy.contains("ICU").parents("tr").contains("Fred Bloggs").should("not.exist")
  cy.log("changing observable")
  cy.window().invoke("__changeObservable")
  cy.contains("ICU").parents("tr").contains("Fred Bloggs").should("exist")
  cy.contains("Emergency").parents("tr").contains("Fred Bloggs").should("not.exist")
  unmount()
})
it("should allow two names in same box", () => {
  const allDuties = makeAllDuties()

  mount(
    <WeekView allDuties={allDuties} viewDate={new Date(2021, 2, 4)} theatreNames={theatreNames} />
  )
  cy.window().then((win) => {
    win.__changeObservable = action(() => {
      allDuties[1].startTime = new Date(2021, 2, 3, 8)
      allDuties[1].finishTime = new Date(2021, 2, 3, 18)
    })
  })

  cy.contains("Emergency").parents("tr").contains("Fred Bloggs").should("exist")
  cy.contains("Joe Bloggs").parents("td").should("not.contain.text", "Fred Bloggs")
  cy.log("changing observable")
  cy.window().invoke("__changeObservable")
  cy.contains("Joe Bloggs").parents("td").should("contain.text", "Fred Bloggs")
  unmount()
})
