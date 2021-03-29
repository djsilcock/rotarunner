const readline = require("readline");
const mobx = require("mobx");
const { exit } = require("process");
const chalk = require("chalk");
const lodash = require("lodash");

const cache = {};
const staffnames = [
	"joanne",
	"sanjiv",
	"pam",
	"choiti",
	"sam",
	"rory",
	"scott",
	"jim",
	"dan",
];
const NONCLINICAL = Symbol("nonclinical");
const session = Symbol("session");
const leave = Symbol("leave");
const LEAVE = Symbol("leave");
const THEATRE = Symbol("theatre");
const ICU = Symbol("icuconsultant");

const weekdaynames = [
	"monday",
	"tuesday",
	"wednesday",
	"thursday",
	"friday",
	"saturday",
	"sunday",
];
const jobplan = {
	joanne: [
		THEATRE,
		THEATRE,
		NONCLINICAL,
		THEATRE,
		THEATRE,
		NONCLINICAL,
		NONCLINICAL,
	],
	sanjiv: [
		THEATRE,
		NONCLINICAL,
		THEATRE,
		NONCLINICAL,
		THEATRE,
		NONCLINICAL,
		NONCLINICAL,
	],
	pam: [
		NONCLINICAL,
		THEATRE,
		THEATRE,
		NONCLINICAL,
		NONCLINICAL,
		NONCLINICAL,
		NONCLINICAL,
	],
	choiti: [
		NONCLINICAL,
		THEATRE,
		THEATRE,
		NONCLINICAL,
		THEATRE,
		NONCLINICAL,
		NONCLINICAL,
	],
	sam: [
		NONCLINICAL,
		THEATRE,
		THEATRE,
		NONCLINICAL,
		NONCLINICAL,
		NONCLINICAL,
		NONCLINICAL,
	],
	rory: [
		NONCLINICAL,
		NONCLINICAL,
		NONCLINICAL,
		NONCLINICAL,
		NONCLINICAL,
		NONCLINICAL,
	],
	scott: [
		NONCLINICAL,
		NONCLINICAL,
		NONCLINICAL,
		THEATRE,
		THEATRE,
		NONCLINICAL,
		NONCLINICAL,
	],
	jim: [
		THEATRE,
		NONCLINICAL,
		NONCLINICAL,
		THEATRE,
		THEATRE,
		NONCLINICAL,
		NONCLINICAL,
	],
	dan: [
		NONCLINICAL,
		THEATRE,
		NONCLINICAL,
		THEATRE,
		THEATRE,
		NONCLINICAL,
		NONCLINICAL,
	],
};
const isWeekend = (day) => day.day % 7 > 3;
const isOnLeave = () => false;

availableShifts = {
	monday: ["weekdayDaytime", "weekdayEvening"],
	tuesday: ["weekdayDaytime", "weekdayEvening"],
	wednesday: ["weekdayDaytime", "weekdayEvening"],
	thursday: ["weekdayDaytime", "weekdayEvening"],
	friday: ["weekendDaytime", "weekendEvening"],
	saturday: ["weekendDaytime", "weekendEvening"],
	sunday: ["weekendDaytime", "weekendEvening"],
};

constraints = [
	{
		name: "must not be on leave",
		test: (expect, day) => {
			if (day.duties.leave) {
				expect(!day.duties.icuDaytime);
				expect(!day.duties.icuEvening);
			}
		},
		key: "notOnLeave",
	},
	{
		name: "no consecutive runs of ICU or oncalls after ICU week(end)",
		test: (expect, day) => {
			if (day.weekdayname == "monday" && day.duties.weekdayDaytime)
				expect(!day.getDay(-1).duties.weekendDaytime);
		},
		key: "noICUafterWeekend",
	},
	{
		name: "no consecutive runs of ICU or oncalls after ICU week(end)",
		test: (expect, day) => {
			if (day.weekdayname == "friday" && day.duties.weekendDaytime)
				expect(!day.getDay(-1).duties.weekdayDaytime);
		},
		key: "noICUafterWeek",
	},
	{
		name: "no weekday oncalls before clinical days",
		test: (expect, day) => {
			if (day.duties.weekdayEvening) expect(day.getDay(+1).duties.nonclinical);
		},
		key: "notBeforeClinicalDay",
	},
	{
		name: "no consecutive nights",
		test: (expect, day) => {
			if (day.duties.weekdayEvening) {
				expect(!day.getDay(+1).duties.weekdayEvening);
				expect(!day.getDay(+1).duties.weekendEvening);
			}
		},
		key: "noConsecutiveNights",
	},
	{
		name: "ICU Thursday night",
		test: (expect, day) => {
			if (day.weekdayname == "thursday" && day.duties.weekdayDaytime)
				expect(day.duties.weekdayEvening);
		},
		key: "preferICUThursdayNight",
	},
];

const constraintkeysTemplate = constraints.reduce(
	(acc, constraint) => Object.assign(acc, { [constraint.key]: 0 }),
	{}
);
const constraintStore = {};

function registerConstraint({ staffmemberday, day, constraint }) {
	const constraintBox = mobx.computed(function () {
		//console.log(
		//	`Recalculate ${constraint.key} for ${staffmemberday.me} on ${day}`
		//);
		var score = 0;
		const expect = (condition) => {
			if (!condition) score += 1;
		};
		try {
			constraint.test(expect, staffmemberday);
		} catch {
			score = 0;
		}
		return score;
	});
	for (let constraintkey of [constraint.key, "all"]) {
		for (let staffmembername of [staffmemberday.me, "all"]) {
			lodash.defaultsDeep(constraintStore, {
				staffmembers: { [staffmembername]: { [constraintkey]: [] } },
			});
			lodash.defaultsDeep(constraintStore, {
				staffmembers: { [staffmembername]: { [constraintkey]: { [day]: [] } } },
			});
			constraintStore.staffmembers[staffmembername][constraintkey][day].push(
				constraintBox
			);
			lodash.defaultsDeep(constraintStore, {
				constraintkeys: { [constraintkey]: { [staffmembername]: [] } },
			});
			lodash.defaultsDeep(constraintStore, {
				constraintkeys: {
					[constraintkey]: { [staffmembername]: { [day]: [] } },
				},
			});
			constraintStore.constraintkeys[constraintkey][staffmembername][day].push(
				constraintBox
			);
		}
	}
	constraintStore.staffmembers[staffmemberday.me][constraint.key][
		day
	] = constraintBox;
	constraintStore.constraintkeys[constraint.key][staffmemberday.me][
		day
	] = constraintBox;

	return constraintBox;
}
class StaffMemberDay {
	constructor({ staffmember, day, workingDay }) {
		this.jobPlannedActivity = jobplan[staffmember][day % 7];
		this.weekdayname = weekdaynames[day % 7];
		this.me = staffmember;
		this.workingDay = workingDay;
		this.day = day;
		this.constraints = constraints.filter(
			({ days = weekdaynames, staff = staffnames }) =>
				days.includes(this.weekdayname) && staff.includes(staffmember)
		);
		//this.constraintResults = {};
		const smd = this;
		//availableShifts[this.weekdayname].forEach((duty) => {

		this.constraintResults = {};
		this.constraints.forEach((constraint) => {
			if (constraint.days && !constraint.days.includes(this.weekdayname)) {
				registerConstraint({
					staffmemberday: this,
					day,
					constraint: mobx.computed(() => 0),
				});
				return;
			}
			const box = registerConstraint({ staffmemberday: this, day, constraint });
			Object.defineProperty(this.constraintResults, constraint.key, {
				configurable: true,
				enumerable: true,
				get: box.get,
			});
		});
		this.duties = {
			get weekdayDaytime() {
				return !isWeekend(smd) && workingDay.getDutyStaff("day") == smd.me;
			},
			get weekdayEvening() {
				return !isWeekend(smd) && workingDay.getDutyStaff("night") == smd.me;
			},
			get weekendDaytime() {
				return isWeekend(smd) && workingDay.getDutyStaff("day") == smd.me;
			},
			get weekendEvening() {
				return isWeekend(smd) && workingDay.getDutyStaff("night") == smd.me;
			},
			get icuDaytime() {
				return this.weekdayDaytime || this.weekendDaytime;
			},
			get icuEvening() {
				return this.weekendEvening || this.weekdayEvening;
			},
			get leave() {
				try {
					if (
						(smd.weekdayname == "friday" || smd.weekdayname == "monday") &&
						smd.getDay(-1).duties &&
						smd.getDay(-1).duties.icuDaytime
					)
						return true;
				} catch {}
				if (isOnLeave(smd.me, smd.day)) return true;
				return false;
			},
			get theatre() {
				if (this.leave) return false;
				if (jobplan[smd.me][smd.day % 7] == THEATRE) return true;
				return false;
			},
			get nonclinical() {
				//console.log(this);
				return !(this.theatre || this.icuDaytime);
			},
		};
		mobx.makeAutoObservable(this.duties);
	}

	getDay(daydelta) {
		//console.log(this);
		const workingDay = this.workingDay.getDay(daydelta);
		return ((workingDay || {}).staff || {})[this.me] || {};
	}
}

class WorkingDay {
	constructor({ day, calendar, duties }) {
		this.calendar = calendar;
		this.day = day;
		this.staff = {};
		this.weekdayname = weekdaynames[day % 7];
		staffnames.forEach((staffmember) => {
			this.staff[staffmember] = new StaffMemberDay({
				staffmember,
				day,
				workingDay: this,
			});
		});
		this.duties = duties;
		this.constraintResults = {};
		staffnames.forEach((staffmember) => {
			this.constraintResults[staffmember] = this.staff[
				staffmember
			].constraintResults;
		});
	}
	getDay(daydelta) {
		const dayToFetch = this.day + daydelta;
		return (
			this.calendar[dayToFetch] ||
			(() => {
				throw "";
			})()
		);
	}
	getDutyStaff(duty) {
		return this.duties[duty].name.get();
	}
	getDutyType(duty) {
		return this.duties[duty].type;
	}
	setDutyStaff(duty, staffmember) {
		this.duties[duty].name.set(staffmember);
	}
}

class Rota {
	constructor(numdays, generator) {
		const calendar = [];

		{
			let day = 0;
			for (let duties of generator) {
				calendar[day] = new WorkingDay({ day, calendar, duties });
				day++;
				if (day >= numdays) break;
			}
		}

		const constraintResultsByType = {};
		for (let constraintkey of Object.keys(constraintStore.constraintkeys)) {
			const box = mobx.computed(() => {
				return constraintStore.staffmembers.all[constraintkey].reduce(
					(total, current) =>
						total +
						current.reduce((total2, current2) => total2 + current2.get(), 0),
					0
				);
			});
			Object.defineProperty(constraintResultsByType, constraintkey, {
				get: () => box.get(),
				enumerable: true,
			});
		}
		const constraintResultsByStaff = {};
		for (let staffmember of Object.keys(constraintStore.staffmembers)) {
			const box = mobx.computed(() => {
				return constraintStore.constraintkeys.all[staffmember].reduce(
					(total, current) =>
						total +
						current.reduce((total2, current2) => total2 + current2.get(), 0),
					0
				);
			});
			Object.defineProperty(constraintResultsByStaff, staffmember, {
				get: box.get,
			});
		}
		this.calendar = calendar;
		mobx.extendObservable(this, {
			get totalScore() {
				return constraintStore.staffmembers.all.all.reduce(
					(total, current) =>
						total +
						current.reduce((total2, current2) => total2 + current2.get(), 0),
					0
				);
			},
		});
		this.constraintResultsByStaff = constraintResultsByStaff;
		this.constraintResultsByType = constraintResultsByType;
	}
}

function shuffle(arr) {
	let shuffled = arr.slice();
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * i);
		const k = shuffled[i];
		shuffled[i] = shuffled[j];
		shuffled[j] = k;
	}
	return shuffled;
}

function* staffnamesiterator(seed = []) {
	yield* seed;
	while (true) {
		let initialoncalldays = shuffle(staffnames);
		yield* initialoncalldays;
	}
}

function* rotaGenerator({
	weekdayDaytime,
	weekdayEvening,
	weekendDaytime,
	weekendEvening,
}) {
	while (true) {
		const weekdayDaysBox = {
			type: "weekdayDays",
			name: mobx.observable.box(weekdayDaytime.next().value),
		};
		const weekendDaysBox = {
			type: "weekendDays",
			name: mobx.observable.box(weekendDaytime.next().value),
		};
		const wkendEveningBox = {
			type: "weekendNights",
			name: mobx.observable.box(weekendEvening.next().value),
		};
		const mondayEvening = {
			type: "weekdayNights",
			name: mobx.observable.box(weekdayEvening.next().value),
		};
		const tuesdayEvening = {
			type: "weekdayNights",
			name: mobx.observable.box(weekdayEvening.next().value),
		};
		const wednesdayEvening = {
			type: "weekdayNights",
			name: mobx.observable.box(weekdayEvening.next().value),
		};
		const thursdayEvening = {
			type: "weekdayNights",
			name: mobx.observable.box(weekdayEvening.next().value),
		};
		const week = [
			{ day: weekdayDaysBox, night: mondayEvening },
			{ day: weekdayDaysBox, night: tuesdayEvening },
			{ day: weekdayDaysBox, night: wednesdayEvening },
			{ day: weekdayDaysBox, night: thursdayEvening },
			{ day: weekendDaysBox, night: wkendEveningBox },
			{ day: weekendDaysBox, night: wkendEveningBox },
			{ day: weekendDaysBox, night: weekendDaysBox },
		];
		yield* week;
	}
}

rota = new Rota(
	63,
	rotaGenerator({
		weekdayDaytime: staffnamesiterator(),
		weekdayEvening: staffnamesiterator(),
		weekendDaytime: staffnamesiterator(),
		weekendEvening: staffnamesiterator(),
	})
);

mobx.autorun(() => rota.totalScore);
console.log(rota.totalScore);
console.log(JSON.stringify(rota.constraintResultsByType));
printrota(rota);
const allPossibleDuties = [];
rota.calendar.forEach((wd) => {
	allPossibleDuties.push(wd.duties.day);
	allPossibleDuties.push(wd.duties.night);
});
function swap(thisduty, thatduty) {
	return mobx.runInAction(() => {
		if (thisduty === thatduty) return false;
		if (thisduty.type !== thatduty.type) return false;
		if (thisduty.name === thatduty.name) return false;
		const thisperson = thisduty.name.get();
		const thatperson = thatduty.name.get();
		if (thisperson == thatperson) return false;
		thisduty.name.set(thatperson);
		thatduty.name.set(thisperson);
		return true;
	});
}

const playbook = [
	{
		change: ["weekdayDays", "weekendDays", "weekendNights"],
		constraints: ["notOnLeave", "noICUafterWeekend", "noICUafterWeek"],
	},
	{
		change: ["weekdayNights"],
		constraints: [
			"notOnLeave",
			"noICUafterWeekend",
			"noICUafterWeek",
			"notBeforeClinicalDay",
			"noConsecutiveNights",
			"preferICUThursdayNight",
		],
	},
];
outerlabel: for (let { change, constraints } of playbook) {
	console.log(`Changing ${change.join()} to solve ${constraints.join()}`);
	const dutiesList = allPossibleDuties.filter((duty) =>
		change.includes(duty.type)
	);
	const levelTotalBox = mobx.computed(() =>
		constraints.reduce(
			(total, constraintkey) =>
				total + rota.constraintResultsByType[constraintkey],
			0
		)
	);
	const serialisedResults = () => JSON.stringify(rota.constraintResultsByType);

	const getSerialisedRota = () => {
		return dutiesList.map((duty) => duty.name.get()).join();
	};
	const unwatch = mobx.autorun(() => {
		levelTotalBox.get();
	});
	let bestscore = levelTotalBox.get();

	iterationLoop: for (let a = 0; a < 100; a++) {
		console.log(`iteration ${a}, score ${bestscore}`);
		const tempDutiesList = shuffle(dutiesList);
		let thisIterationBestScore = Infinity;
		let potentialSwap = null;
		let bestResult = serialisedResults();

		while (tempDutiesList.length > 1) {
			const dayToCheck = tempDutiesList.pop();
			const prevtotal = levelTotalBox.get();
			if (prevtotal < thisIterationBestScore)
				thisIterationBestScore = prevtotal;
			for (let duty of tempDutiesList) {
				{
					if (dayToCheck === duty) continue;
					if (!swap(dayToCheck, duty)) continue;

					const newtotal = levelTotalBox.get();

					//console.log(newtotal, prevtotal);
					if (newtotal == 0) break iterationLoop;
					if (newtotal < prevtotal) break;
					if (
						potentialSwap == null &&
						newtotal == prevtotal &&
						bestResult !== serialisedResults()
					) {
						potentialSwap = [dayToCheck, duty];
					}
					swap(dayToCheck, duty);
				}
			}
		}
		if (thisIterationBestScore == bestscore) {
			console.warn(
				`May be stuck at local minimum (${bestscore}), attempting random swap`
			);
			swap(...potentialSwap);
			potentialSwap = null;
		}
		if (thisIterationBestScore < bestscore) bestscore = thisIterationBestScore;
	}
	unwatch();
}
console.log(rota.totalScore);
console.log(JSON.stringify(rota.constraintResultsByType));

printrota(rota);

function printrota(rota) {
	commentary = [];
	output = [];
	staffnames.forEach((sn) => {
		duties = rota.calendar
			.map((wd) => {
				smd = wd.staff[sn];
				//console.log(JSON.stringify(wd.duties.weekdayDaytime));
				if (smd.duties.weekdayDaytime && smd.duties.weekdayEvening)
					return chalk.bgYellow.red("N");
				if (smd.duties.weekdayDaytime) return chalk.bgYellow("-");
				if (smd.duties.weekendDaytime) return chalk.bgYellow("-");
				if (smd.duties.weekdayEvening) return chalk.white("N");
				if (smd.duties.weekendEvening) return chalk.blue("N");

				if (smd.duties.theatre) return "-";
				return " ";
			})
			.join(" ");
		output.push(sn.padEnd(10) + duties);
		console.log(sn.padEnd(10) + duties);
	});
	console.log(
		"          " + rota.calendar.map((wd) => "MTWTFSS"[wd.day % 7]).join(" ")
	);
}
