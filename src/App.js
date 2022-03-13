import EmployeesTable from './EmployeesTable';
import UploadFile from './UploadFile';
import { useState } from 'react';
import moment from "moment";
import "./index.css";

function App() {
  const [commonProjects, setCommonProjects] = useState([]);
  const onFileLoad = (data) => {
    let result = getCommonProjectsOfLongestWorkingPair(data);
    setCommonProjects(result);
  }

  return (
    <div className='mainContainer'>
    <UploadFile onFileLoad={onFileLoad}/>
    <EmployeesTable commonProjects={commonProjects}/>
    </div>
  );
}

export default App;

function getCommonProjectsOfLongestWorkingPair (data) {
  let projects = getAllProjects(data);
  let pairsWorkedTogether = [];

  projects.forEach(project => {
    project.pairs = getEmployeesWorkedTogether(project.employees);

    let pairs = project.pairs;
    pairs.forEach(pair => {
      let hasPair = pairsWorkedTogether.filter(pairObj => {
        let hasPairCase1 = pair.emp1ID === pairObj.emp1ID && pair.emp2ID === pairObj.emp2ID;
        let hasPairCase2 = pair.emp1ID === pairObj.emp2ID && pair.emp2ID === pairObj.emp1ID;
        return hasPairCase1 || hasPairCase2;
      });

      if(hasPair.length === 0){
        pairsWorkedTogether.push({
          emp1ID: pair.emp1ID,
          emp2ID: pair.emp2ID,
          days: 0
        });
      }
    })
  });

  pairsWorkedTogether.forEach(pair => {
    return pair.days = calculateTimePairWorkedTogether(projects, pair.emp1ID, pair.emp2ID);
  });

  let longestWorkingPair = findLongestWorkingPair(pairsWorkedTogether);

  let longestWorkingPairProjects = projects.filter(project => {
    let employee1ID = longestWorkingPair.emp1ID;
    let employee2ID = longestWorkingPair.emp2ID;

    let employees = project.employees;

    let employee1 = employees.find(empl => empl.id === employee1ID);
    let employee2 = employees.find(empl => empl.id === employee2ID);

    let pairExists = employee1 && employee2;

    let workedTogether = false;
    if(pairExists){
      workedTogether = !!calculateTimeWorkedTogether(employee1.dateFrom, employee1.dateTo, employee2.dateFrom, employee2.dateTo);
    }
    return workedTogether;
  }).map(project => {
    let days = project.pairs.find(pair => {
      let validPairCase1 = pair.emp1ID === longestWorkingPair.emp1ID && pair.emp2ID === longestWorkingPair.emp2ID;
      let validPairCase2 = pair.emp1ID === longestWorkingPair.emp2ID && pair.emp2ID === longestWorkingPair.emp1ID;

      return validPairCase1 || validPairCase2;
    }).time;

    return {
      emp1ID: longestWorkingPair.emp1ID,
      emp2ID: longestWorkingPair.emp2ID,
      projectID: project.id,
      days: days
    }
  });

  return longestWorkingPairProjects;
}

function getEmployeesWorkedTogether (employees) {
  let pairs = [];
  for(let i=0; i < employees.length-1; i++){
    for(let j=i+1; j < employees.length; j++){
      let employee1 = employees[i];
      let employee2 = employees[j];
      let time = calculateTimeWorkedTogether(employee1.dateFrom, employee1.dateTo, employee2.dateFrom, employee2.dateTo);

      if(time){
        pairs.push({
          emp1ID: employee1.id,
          emp2ID: employee2.id,
          time
        });
      }
    }
  }
  return pairs;
}

function calculateTimePairWorkedTogether (projects, empID1, empID2) {
  let days = projects.reduce((accum, project) => {

    let pairs = project.pairs;
    let projectDaysWorked = pairs.reduce((pairAcc, pair) => {
      let validPairCase1 = pair.emp1ID === empID1 && pair.emp2ID === empID2;
      let validPairCase2 = pair.emp1ID === empID2 && pair.emp2ID === empID1;

      if(validPairCase1 || validPairCase2) {
        return pairAcc + pair.time;
      }

      return pairAcc;
    }, 0);
    return accum + projectDaysWorked;
  }, 0);

  return days;
}

function getAllProjects (data) {
  let projectIDs = new Set(data.map(entry => entry.projectID));
  let projects = Array.from(projectIDs).map(projectID => {
    return {
      id: projectID,
      employees: []
    }
  });

  data.forEach(entry => {
    let project = projects.find(project => project.id === entry.projectID);

    project.employees.push({
      id: entry.empID,
      dateFrom: entry.dateFrom,
      dateTo: entry.dateTo === "NULL" ? null : entry.dateTo
    });
  });

  return projects;

}

function calculateTimeWorkedTogether (emp1Start, emp1End, emp2Start, emp2End) {
  emp1End = emp1End ? emp1End : moment.now();
  emp2End = emp2End ? emp2End : moment.now();

  let date1, date2;
  let start1 = moment(emp1Start).valueOf();
  let start2 = moment(emp2Start).valueOf();
  let end1 = moment(emp1End).valueOf();
  let end2 = moment(emp2End).valueOf();

  if(start1 <= start2 && end1 <= end2){
    date1 = end1;
    date2 = start2;
  }
  else if(start1 > start2 && end1 > end2){
    date1 = end2;
    date2 = start1;
  }
  else if(start1 > start2 && end1 < end2){
    date1 = end1;
    date2 = start1;
  }
  else if(start1 < start2 && end1 > end2){
    date1 = end2;
    date2 = start2;
  }

  let valueA = moment(date1);
  let valueB = moment(date2);

  let result = valueA.diff(valueB, "days");
  return result <= 0 ? 0 : result;
}

function findLongestWorkingPair (pairs) {
  let mostDays = 0;
  let pairIndex = 0;

  pairs.forEach((pair, index) => {
    if(pair.days > mostDays){
      mostDays = pair.days;
      pairIndex = index;
    }
  });

  return pairs[pairIndex];
}