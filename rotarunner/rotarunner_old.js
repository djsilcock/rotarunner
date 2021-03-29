const cache={}
const staffnames=['joanne','sanjiv','pam','choiti','sam','rory','scott','jim','dan']
const nonclinical=Symbol()
const session=Symbol()
const leave=Symbol()
const onlyificuweek=Symbol()

const jobplan={
	joanne:[session,session,nonclinical,session,session],
	sanjiv:[session,nonclinical,session,nonclinical,session],
	pam:[nonclinical,session,session,nonclinical,nonclinical],
	choiti:[nonclinical,session,session,nonclinical,session],
	sam:[nonclinical,session,session,nonclinical,nonclinical],
	rory:[nonclinical,nonclinical,nonclinical,nonclinical,nonclinical],
	scott:[nonclinical,nonclinical,nonclinical,session,session],
	jim:[session,nonclinical,nonclinical,session,session],
	dan:[nonclinical,session,nonclinical,session,session]
}

class WorkingDay{
	constructor(day){
		this.staff={}
		this.day=day
		this.availablestaff=null
		const cachekey='day'+day
		if (cache[cachekey]) {
			Object.assign(this.staff,cache[cachekey].staff)
			Object.assign(this.availablestaff,cache[cachekey].availablestaff)
			return
		}		
		staffnames.forEach(name=>{this.staff[name]=jobplan[name][day]})
		}
	check(nextday){
		this.availablestaff={}
		staffnames.forEach(name=>{
			if (nextday.staff[name]==session) return this.availablestaff[name]=false
			if (nextday.staff[name]==leave) return this.availablestaff[name]=false
			if (this.staff[name]==leave) return this.availablestaff[name]=false
			if (this.staff[name]==nonclinical) return this.availablestaff[name]=nonclinical
			return this.availablestaff[name]=true
		})
		cache['day'+this.day]=this
		}
	getAvailableStaff(icuconsultant){
		return staffnames.filter(name=>((icuconsultant==name && this.day==3) || (icuconsultant!=name && this.availablestaff[name]!=false)))	
	}
}


const workingWeek=[0,1,2,3,4].map(day=>(new WorkingDay(day)))

const dayspermutations=[0,1,2,3].map(day=>{  
	workingWeek[day].check(workingWeek[day+1])
	return workingWeek[day].getAvailableStaff('derek')
})

const alldaycombinations=[]
{[0,1,2,3,4].forEach(monday=>{
	[0,1,2,3,4].forEach(tuesday=>{
		[0,1,2,3,4].forEach(wednesday=>{
			[0,1,2,3,4].forEach(thursday=>{
				if (monday+tuesday+wednesday+thursday==4) alldaycombinations.push([monday,tuesday,wednesday,thursday])
			})
		})
	})
})
}
staffcombinationsmap={}
	staffnames.forEach(name=>
		staffcombinationsmap[name]=function* () {
		
			yield* alldaycombinations.filter(combination=>
				combination.every((combday,i)=>
					(combday==0 || dayspermutations[i].includes(name)||(combday==1&&i==3))
				)
			).map(c=>({[name]:c}))
		}
	)

console.log (staffcombinationsmap)
const staffpossibilities={}

function* iterateoveriterators(rootvalue,first,...others){
		
		for (value of first()){
			if (others.length>0){
				yield* iterateoveriterators(Object.assign({},rootvalue,value),...others)
				
			}else{
				//console.log(Object.assign({},rootvalue,value))
				let result=Object.assign({},rootvalue,value)
				let totals=Object.values(result).reduce((old,newval)=>{
						return [0,1,2,3].map(v=>old[v]+newval[v])
					}
				)
				//console.log(totals)
				if (totals.every(t=>t==9)){
				
				yield result}
			}
		}
	
}

staffnames.forEach(v=>{staffpossibilities[v]={}}) 

iter=iterateoveriterators({},...Object.values(staffcombinationsmap))
arr=Array.from(iter)
console.log(arr.length)
arr.forEach(element=>{
	let tags=[]
	Object.entries(element).forEach(([k,v])=>{tags.push(k+'-'+v.join('-'))})
	element.tags=tags
})
arr1=arr.filter((el)=>!el.tags.includes('pam-0-0-1-3'))
console.log(arr1)