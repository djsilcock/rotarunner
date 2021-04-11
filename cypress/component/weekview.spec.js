/* eslint-env mocha */
import React from 'react'
import {mount} from '@cypress/react'
import { observable,runInAction } from 'mobx'
import WeekView from '../../components/WeekView'

const allDuties = observable([
    {
      id: 0,
      location: "EmgTh",
      startTime: new Date(2021,2,3,8),
      finishTime: new Date(2021,2,3,18),
      staffName: "Joe Bloggs",
      staffLevel: "ST5",
      staffGroup: "higher",
    },
    {
      id: 1,
      location: "EmgTh",
      startTime: new Date(2021,2,4,13),
      finishTime: new Date(2021,2,4,18),
      staffName: "Fred Bloggs",
      staffLevel: "CT1",
      staffGroup: "core",
    },
  ])
  const theatreNames = [
    { shortName: "EmgTh", theatreName: "Emergency Theatre" },
    { shortName: "ICU", theatreName: "ICU" },
    { shortName: "Th1", theatreName: "Theatre 1" },
  ];
  

    it('should change when observable changes',()=>{
	mount(<WeekView allDuties={allDuties} viewDate={new Date(2021,2,4)} theatreNames={theatreNames}/>)
    
        cy.contains('Emergency').parents('tr').contains('Fred Bloggs').should('exist')
        cy.contains('ICU').parents('tr').contains('Fred Bloggs').should('not.exist')
        cy.wrap(allDuties).then(allDuties=>{
		expect(allDuties.length).to.be.at.least(1)
		const idx=allDuties.findIndex((el)=>(el.staffName=="Fred Bloggs"))
		expect(idx).to.be.at.least(0)
		allDuties[idx].location="ICU"}
	)
        cy.contains('ICU').parents('tr').contains('Fred Bloggs').should('exist')
        cy.contains('Emergency').parents('tr').contains('Fred Bloggs').should('not.exist')
    })
