/*import React, { MutableRefObject } from 'react'
import { startOfToday, startOfTomorrow } from "date-fns";
import { action, makeAutoObservable, observable } from "mobx";
import { ObservableGroupMap } from "mobx-utils";
import { RequestListSpecChangeForm } from "../../../app/core/components/weekView/requestListSpecChangeForm";
import { destroy, detach, getParent, getParentOfType, getPathParts, getRoot, resolveIdentifier, types } from 'mobx-state-tree'

export enum StaffGroup {
  Consultant = 'consultant',
  StaffGrade = 'nccg',
  Higher = 'higher',
  Intermediate = 'intermed',
  Core = 'core',
  Novice = 'novice',
  AA = 'aa',
  ANPCC = 'anpcc',
  AHP = 'ahp',
  Admin = 'admin'
}

export interface IStaffMember {
  id: string | number;
  firstName: string;
  lastName: string;
  staffGroup: StaffGroup;
  staffLevel: string;
}

export interface ITheatreList {
  id: number;
  day: Date;
  theatre: string;
  theatreId: string;
  surgeonId: string | number;
  surgeon: string;
  specialty: string;
  specialtyId: string
  startTime: number;
  finishTime: number;
  sessionType: string;
  duties: IStaffDuty[]
}

const sessionTimes = {
  am: [8, 13],
  pm: [13, 18],
  day: [8, 18],
  evening: [18, 21],
  late: [13, 21],
  night: [20, 32],
  '24h': [8, 32],
  'on-call': [18, 32],
  '3sess': [8, 21],
}

const Theatre = types.model({
  id: types.identifier,
  name: types.string
})
const Specialty = types.model({
  id: types.identifier,
  name: types.string,
})
const Surgeon = types.model({
  id: types.identifier,
  title: types.string,
  firstName: types.string,
  lastName: types.string,
  specialties: types.array(Specialty)
})
  .views(self => ({
    get fullName() { return self.firstName + ' ' + self.lastName }
  }))

const StaffMember = types.model({
  id: types.identifier,
  firstName: types.string,
  lastName: types.string,
  staffGroup: types.string,
  staffLevel: types.string,
})
  .views(self => ({
    get fullName() { return self.firstName + ' ' + self.lastName }
  }))


const SessionType = types.model({
  id: types.identifier,
  startTime: types.number,
  finishTime: types.number
})

const StaffDuty = types.model({
  staffMember: types.reference(StaffMember),
  sessionType: types.safeReference(SessionType)
})

const TheatreList = types.model({
  id: types.identifier,
  surgeon: types.reference(Surgeon),
  specialty: types.reference(Specialty),
  sessionType: types.reference(SessionType),
  staff: types.array(StaffDuty)
})
  .views((self) => ({
    get day() { return getParentOfType(self, WorkDay).day },
    get theatre() {
      const theatreId = getPathParts(getParent(self)).pop()
      return resolveIdentifier(Theatre,getRoot(self),theatreId)
    },
    get startTime() { return self.sessionType.startTime },
    get finishTime() { return self.sessionType.finishTime },
    get timeClashes() {
      const otherLists = getParent(self)
      return otherLists.filter(other => !(
        (other.finishTime <= this.startTime) || (other.startTime>=this.finishTime)
      ))
    }
  }))
  .actions((self) => ({
    setSurgeon(surgeon) { self.surgeon = surgeon },
    setSpecialty(spec) { self.specialty = spec },
    setSessionType(sessType) { self.sessionType = sessType },
    addStaffDuty({ staffMember, sessionType }) {
      self.staff.push({ staffMember, sessionType })
    },
    removeStaffDuty(duty) { destroy(duty) }
  }))

const TheatreDay = types.model({
  theatre: types.reference(Theatre),
  lists: types.array(TheatreList)
})
  .views(self => ({
    get day() { return getParentOfType(self, WorkDay).day },
    allDuties() {
      return Array.from((
        function* () {
          for (const list of self.lists) {
            yield* list.staff
          }
        })())
    }

  }))
  .actions(self => ({
    addList(list) { self.lists.push(list) },
    deleteList(list) { destroy(list) },
    moveList(list,theatreDay){theatreDay.lists.push(detach(list))}
  }))

const WorkDay = types.model({
  day: types.Date,
  theatres: types.map(types.array(TheatreList))
})

const workdays = [
  {
    day: startOfToday(),
    theatres: {

  }}
]

const allTheatreLists = observable.array([
  new TheatreList({
    id: 100,
    day: startOfToday(),
    theatreId: "EmgTh",
    surgeonId: undefined,
    specialtyId: "Emg",
    sessionType: '24h'
  }),
  new TheatreList({
    id: 101,
    day: startOfTomorrow(),
    theatreId: "ICU",
    surgeonId: undefined,
    specialtyId: "ICU",
    sessionType: '24h'
  }),
  new TheatreList({
    id: 102,
    day: startOfToday(),
    theatreId: "Th1",
    surgeonId: '201',
    specialtyId: "GS",
    sessionType: 'am'
  }),
  new TheatreList({
    id: 103,
    day: startOfToday(),
    theatreId: "Th1",
    surgeonId: '201',
    specialtyId: "GS",
    sessionType: 'pm'
  })
])

const staffMembers = observable.map<string, IStaffMember>({
  joebloggs: {
    id: 'joebloggs',
    firstName: "Joe",
    lastName: "Bloggs",
    staffGroup: StaffGroup.Higher,
    staffLevel: 'ST5'
  },
  fredbloggs: {
    id: 'fredbloggs',
    firstName: "Fred",
    lastName: "Bloggs",
    staffGroup: StaffGroup.Core,
    staffLevel: 'CT1'
  }
},
)

export interface IStaffDuty {
  id: number;
  listId: number;
  staffmember: IStaffMember;
  sessionType?: string

}

const allDuties = observable.array([
  new StaffDuty({
    id: 1,
    listId: 100,
    staffmemberId: 'joebloggs'
  }),
  new StaffDuty({
    id: 2,
    listId: 101,
    staffmemberId: 'fredbloggs'
  }),
  new StaffDuty({
    id: 3,
    listId: 102,
    staffmemberId: 'joebloggs'
  })
]);

const theatreNames = new Map([
  ["EmgTh", "Emergency Theatre"],
  ["ICU", "ICU"],
  ["Th1", "Theatre 1"]
]);

const specialties = new Map([
  ['GS', 'General Surgery'],
  ['ENT', 'ENT']
])

const surgeons = [
  ['GS', '201', 'John Smith'],
  ['GS', '202', 'John Doe'],
  ['GS', '203', 'Hannibal Lecter'],
  ['ENT', '204', 'Deep Throat'],
  ['ENT', '205', 'John Tonsil']
]
const specSurgeonsMap = new Map()
const surgeonsMap = new Map()
surgeons.forEach(([spec, id, name]) => {
  if (!specSurgeonsMap.has(spec)) specSurgeonsMap.set(spec, new Map())
  specSurgeonsMap.get(spec).set(id, name)
  surgeonsMap.set(id, name)
})


const theatreListsMap = new ObservableGroupMap<string, ITheatreList>(allTheatreLists, (duty) => `${duty.day.toDateString()}-${duty.theatreId}`)
const theatreDutiesMap = new ObservableGroupMap<number, IStaffDuty>(allDuties, (duty) => duty.listId)
export function getListsForTheatreDay(day: Date, theatreName: string): ITheatreList[] {

  return theatreListsMap.get(`${day.toDateString()}-${theatreName}`) ?? []
}
export function getTheatreNames(): Map<string, string> { return theatreNames }
export const modals = observable.box(null)

interface DraggedTheatreList {
  type: "list"
  list: ITheatreList
}
interface DraggedDuty {
  type: "duty"
  duty: IStaffDuty
}
interface DropEmpty {
  type: "vacant"
  dutyDay: Date
  location: string
}
interface DragAction {
  from: { data: MutableRefObject<DraggedTheatreList | DraggedDuty> }
  to: { data: MutableRefObject<DraggedTheatreList | DropEmpty> }
}



export function dispatchAction(action, helpers) {
  console.log(action, helpers)
  switch (action.type) {
    case 'unknown':
      console.log('unknown action', action)
      break
    case 'drag':
      handleDragAction(action)
      break
    case 'deleteList':
      console.log('delete list')
      action.list.duties.forEach(duty => allDuties.remove(duty))
      allTheatreLists.remove(action.list)
      break
    case 'requestListSpecChange':
      {
          helpers.requestPopupDialog('',
          <RequestListSpecChangeForm
            initialValues={{
              specialty: action.list.specialtyId,
              surgeon: action.list.surgeonId
            }}
          />)
        .then((values) => {
          if (!values) return
          dispatchAction(
            {
              type: 'changeListSpec',
              list: action.list,
              newSurgeon: values.surgeonId,
              newSpecialty: values.specialtyId
            }, helpers)

        })
      }
      break
    case 'changeListSpec':
      updateList(
        action.list,
        {
          surgeonId: action.newSurgeon,
          specialtyId: action.newSpecialty
        })
      break
    case 'requestNewList':
      {
        const state = observable({
          specialty: null,
          setSpecialty(val) { this.specialtyId = val },
          surgeon: null,
          setSurgeon(val) { this.surgeonId = val },
          startTime: 'am',
          sessions: 2,
          get specialtyOptions() { return Array.from(specialties.entries()) },
          get surgeonOptions() { return specSurgeonsMap.get(this.specialtyId) || new Map() }
        })
        state.setSurgeon(action.list.surgeonId)
        state.setSpecialty(action.list.specialtyId)
        helpers.requestPopupDialog('', <RequestListSpecChangeForm initialValues={surgeon:action.list.surgeonId,specialty:action.list.specialtyId} />).then((ok) => {
          if (!ok) return
          dispatchAction({ type: 'changeListSpec', list: action.list, newSurgeon: state.surgeonId, newSpecialty: state.specialtyId }, helpers)

        })
      }
      break
    case 'contextmenu':
      handleContextMenu(action, helpers);
      break
    default:
      console.log('unknown action', action)

  }
}



const contextMenus = {
  list: [
    ['requestListSpecChange', 'Change surgeon / specialty...'],
    ['requestListMove', 'Change location/times...'],
    ['requestListSplit', 'Split...'],
    ['requestAddPeople', 'Add people...'],
    ['deleteList', 'Delete list']
  ],
  duty: [
    ['removePersonFromList', 'Remove from list'],
    ['requestChangeDutyTime', 'Change duty time']
  ],
  vacant: [
    ['requestNewList', 'Add new list...']
  ]
};

function handleContextMenu(action, helpers) {
  const anchorEl = action.ref.current
  helpers.requestContextMenu(anchorEl, contextMenus[action.celldata.type])
    .then((menu) => {
      dispatchAction({ ...action, ...action.celldata, type: menu }, helpers);

    })
    ;
}



const updateDuty = action(function updateDuty(duty: IStaffDuty, updates: Partial<IStaffDuty>) {
  Object.assign(duty, updates)
  console.log(duty)
})
const updateList = action(function updateList(list: ITheatreList, updates: Partial<ITheatreList>) {
  Object.assign(list, updates)
  console.log(list)
})

function handleDragAction(action: DragAction) {
  const from = action.from.data.current;
  const to = action.to.data.current;
  console.log(from, to);
  if (from.type == 'duty' && to.type == 'list') {
    updateDuty(from.duty, { listId: to.list.id })
    return;
  }
  if (from.type == 'list' && to.type == 'list') {
    updateList(from.list, {
      day: to.list.day,
      theatreId: to.list.theatreId
    })
    return;
  }
  if (from.type == 'list' && to.type == 'vacant') {
    updateList(from.list, {
      day: to.dutyDay,
      theatreId: to.location
    })
    return;
  }
}

*/
