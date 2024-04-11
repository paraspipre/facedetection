import React, { useState, useEffect } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { getAttendanceRoute } from '../utils/ApiRoutes';
import axios from 'axios';
import { FaX } from 'react-icons/fa6';
import { round } from 'face-api.js/build/commonjs/utils';

Chart.register(...registerables);

const AllStudent = () => {
   const monthlist = ["January", "February", "March", "April", "May", "June", "July", "August", 'September', 'October', 'November', "December"]
   const [todayDate, setTodayDate] = useState("")
   const [value, onChange] = useState(new Date());
   const [selectedDate, setSeletedDate] = useState("")
   const [attendance, setAttendance] = useState([]);
   const [attendanceToday, setAttendanceToday] = useState([])
   const [attendanceAtDate, setAttendanceAtDate] = useState([])
   const [attendanceAtWeek, setAttendanceAtWeek] = useState([])
   const [attendanceAtMonth, setAttendanceAtMonth] = useState([])
   const [todayExpression, setTodayExpression] = useState([])
   const [dateExpression, setDateExpression] = useState([])
   const [weekExpression, setWeekExpression] = useState([])
   const [monthExpression, setMonthExpression] = useState([])
   const [list, setList] = useState([])
   const [openlist, setOpenList] = useState(false)
   const [graphMonthData, setGraphMonthData] = useState([])

   useEffect(() => {
      getAttendance()
   }, []);

   useEffect(() => {
      const date = new Date();
      let day = date.getDate();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();
      let currentDate = `${day}-${month}-${year}`;
      setTodayDate(currentDate)
   }, [])

   useEffect(() => {
      const date = new Date(value);
      let day = date.getDate();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();
      let currentDate = `${day}-${month}-${year}`;
      setSeletedDate(currentDate)
   }, [value])

   useEffect(() => {
      const attendanceTodayData = attendance?.filter(atn => atn.date === todayDate)
      setAttendanceToday(attendanceTodayData)
   }, [attendance, todayDate])

   useEffect(() => {
      const attendanceAtDateData = attendance?.filter(atn => atn.date === selectedDate)
      setAttendanceAtDate(attendanceAtDateData)
   }, [attendance, selectedDate])

   useEffect(() => {
      const attendanceAtMonthData = attendance?.filter(atn => atn.date.split("-")[1] === selectedDate.split("-")[1])
      setAttendanceAtMonth(attendanceAtMonthData)
   }, [attendance, selectedDate])

   useEffect(() => {
      var parts = selectedDate.split('-');
      var startDate = new Date(parts[2], parts[1] - 1, parts[0]);
      var last7Dates = [];

      for (var i = 0; i < 7; i++) {
         var currentDate = new Date(startDate);
         currentDate.setDate(startDate.getDate() - i);
         var formattedDate = currentDate.getDate() + '-' + (currentDate.getMonth() + 1) + '-' + currentDate.getFullYear();
         last7Dates.push(formattedDate);
      }

      const attendanceAtWeekData = attendance?.filter(atn => last7Dates.includes(atn.date))
      setAttendanceAtWeek(attendanceAtWeekData)
   }, [attendance, selectedDate])

   useEffect(() => {
      const expressionSums = attendanceToday?.reduce((acc, cur) => {
         const expression = cur.expressions;
         Object.keys(expression).forEach(key => {
            acc[key] = (acc[key] || 0) + expression[key];
         });
         return acc;
      }, {});

      const averageExpression = {};
      Object.keys(expressionSums).forEach(key => {
         averageExpression[key] = expressionSums[key] / attendanceToday.length;
      });
      setTodayExpression(averageExpression)
   }, [attendanceToday])

   useEffect(() => {
      const expressionSums = attendanceAtDate?.reduce((acc, cur) => {
         const expression = cur.expressions;
         Object.keys(expression).forEach(key => {
            acc[key] = (acc[key] || 0) + expression[key];
         });
         return acc;
      }, {});

      const averageExpression = {};
      Object.keys(expressionSums).forEach(key => {
         averageExpression[key] = expressionSums[key] / attendanceAtDate.length;
      });
      setDateExpression(averageExpression)
   }, [attendanceAtDate])

   useEffect(() => {
      const expressionSums = attendanceAtMonth?.reduce((acc, cur) => {
         const expression = cur.expressions;
         Object.keys(expression).forEach(key => {
            acc[key] = (acc[key] || 0) + expression[key];
         });
         return acc;
      }, {});

      const averageExpression = {};
      Object.keys(expressionSums).forEach(key => {
         averageExpression[key] = expressionSums[key] / attendanceAtMonth.length;
      });
      setMonthExpression(averageExpression)
   }, [attendanceAtMonth])

   useEffect(() => {
      const expressionSums = attendanceAtWeek?.reduce((acc, cur) => {
         const expression = cur.expressions;
         Object.keys(expression).forEach(key => {
            acc[key] = (acc[key] || 0) + expression[key];
         });
         return acc;
      }, {});

      const averageExpression = {};
      Object.keys(expressionSums).forEach(key => {
         averageExpression[key] = expressionSums[key] / attendanceAtWeek.length;
      });
      setWeekExpression(averageExpression)
   }, [attendanceAtWeek])

   useEffect(() => {
      const data = attendanceAtMonth.reduce((result, obj) => {
         const index = result.findIndex(group => group.length > 0 && group[0].date === obj.date);
         if (index !== -1) {
            result[index].push(obj);
         } else {
            result.push([obj]);
         }
         return result;
      }, []).map(atn => { return { date: atn[0].date.split("-")[0], num: atn.length } })

      setGraphMonthData(data)
      
      console.log(data)
   }, [attendanceAtMonth])

   const handleOpenlist = (attendanceToday) => {
      setList(attendanceToday)
      setOpenList(true)
   }

   const getAttendance = async () => {
      try {
         const response = await axios.get(getAttendanceRoute)
         if (response) {
            setAttendance(response.data)
            console.log(response.data)
         }
      } catch (err) {
         console.log(err)
      }
   }

   return (
      <div className="p-4 h-screen text-white">
         <h1 className="text-3xl font-bold mb-4">All Students</h1>
         <div className="flex flex-col gap-4">
            <div className='flex gap-4'>
               <div className='bg-gray-900 p-4 rounded-[12px]  text-center w-full'>
                  <h2 className="text-2xl font-bold mb-2">Attendance Today</h2>
                  <p className="text-3xl font-bold mt-16 text-blue-600">{attendanceToday.length}</p>
                  <button onClick={() => handleOpenlist(attendanceToday)}>See List</button>
               </div>
               <div className='bg-gray-900 p-4 rounded-[12px]  text-center w-full'>
                  <h2 className="text-2xl font-bold mb-2">Total Attendance</h2>
                  <p className="text-3xl font-bold mt-16 text-blue-600">{attendance.length}</p>
                  <button onClick={() => handleOpenlist(attendance)}>See List</button>
               </div>
               <div className="bg-gray-900 p-4 rounded-[12px]  w-full">
                  <h2 className="text-xl font-bold mb-2">Expression at Today</h2>
                  <Bar data={{
                     labels: todayExpression && Object.keys(todayExpression),
                     color: "#fff",
                     datasets: [{
                        label: 'Expression Today',
                        data: todayExpression && Object.values(todayExpression),
                        borderColor: 'rgba(75,192,192,1)',
                        borderWidth: 1,
                        fill: true
                     }]
                  }}
                     options={{
                        scales: {
                           y: {
                              beginAtZero: true
                           }
                        }
                     }} />
               </div>
            </div>

            <div className='flex justify-between gap-8'>
               <Calendar className="rounded-[12px] text-black" onChange={onChange} value={value} />
               <div className='bg-gray-900 p-4 rounded-[12px]  text-center w-full'>
                  <h2 className="text-2xl font-bold mb-2">Attendance at {selectedDate}</h2>
                  <p className="text-3xl font-bold mt-16 text-blue-600">{attendanceAtDate.length}</p>
                  <button onClick={() => handleOpenlist(attendanceAtDate)}>See List</button>
               </div>
               <div className='bg-gray-900 p-4 rounded-[12px]  text-center w-full'>
                  <h2 className="text-2xl font-bold mb-2">Total Attendance in {monthlist[selectedDate.split("-")[1] - 1]}</h2>
                  <p className="text-3xl font-bold mt-16 text-blue-600">{attendanceAtMonth.length}</p>
                  <button onClick={() => handleOpenlist(attendanceAtMonth)}>See List</button>
               </div>
               <div className="bg-gray-900 p-4 rounded-[12px] w-full">
                  <h2 className="text-xl font-bold mb-2">Expression at {selectedDate}</h2>
                  <Bar data={{
                     labels: dateExpression && Object.keys(dateExpression),
                     color: "#fff",
                     datasets: [{
                        label: 'Expression',
                        data: dateExpression && Object.values(dateExpression),
                        borderColor: 'rgba(75,192,192,1)',
                        borderWidth: 1,
                        fill: true
                     }]
                  }}
                     options={{
                        scales: {
                           y: {
                              beginAtZero: true
                           }
                        }
                     }} />
               </div>

            </div>
            <div className='flex gap-4 w-full'>
               <div className="bg-gray-900 p-4 rounded-[12px] w-full">
                  <h2 className="text-xl font-bold mb-2">Attendance at {monthlist[selectedDate.split("-")[1] - 1]} Month</h2>
                  <Line data={{
                     labels: graphMonthData.map(data => data.date),
                     color: "#fff",
                     datasets: [{
                        label: 'Expression',
                        data:  graphMonthData.map(data => data.num),
                        borderColor: 'rgba(75,192,192,1)',
                        borderWidth: 1,
                        fill: true
                     }]
                  }}
                     options={{
                        scales: {
                           y: {
                              beginAtZero: true
                           }
                        }
                     }} />
               </div>
               <div className="bg-gray-900 p-4 rounded-[12px] w-full">
                  <h2 className="text-xl font-bold mb-2">Expression in Last 7 days from {selectedDate}</h2>
                  <Bar data={{
                     labels: weekExpression && Object.keys(weekExpression),
                     color: "#fff",
                     datasets: [{
                        label: 'Expression',
                        data: weekExpression && Object.values(weekExpression),
                        borderColor: 'rgba(75,192,192,1)',
                        borderWidth: 1,
                        fill: true
                     }]
                  }}
                     options={{
                        scales: {
                           y: {
                              beginAtZero: true
                           }
                        }
                     }} />
               </div>
               <div className="bg-gray-900 p-4 rounded-[12px] w-full">
                  <h2 className="text-xl font-bold mb-2">Expression at {monthlist[selectedDate.split("-")[1] - 1]} Month</h2>
                  <Bar data={{
                     labels: monthExpression && Object.keys(monthExpression),
                     color: "#fff",
                     datasets: [{
                        label: 'Expression',
                        data: monthExpression && Object.values(monthExpression),
                        borderColor: 'rgba(75,192,192,1)',
                        borderWidth: 1,
                        fill: true
                     }]
                  }}
                     options={{
                        scales: {
                           y: {
                              beginAtZero: true
                           }
                        }
                     }} />
               </div>
            </div>
         </div>
         {openlist &&
            <div className='flex flex-col items-center  absolute top-0 right-0 w-screen h-screen backdrop-blur-3xl p-8'>
               <div className='w-[40%]'>
                  <button className='mb-8 border-[1px] p-2 rounded-full' onClick={() => setOpenList(false)}><FaX /></button>
                  <table>
                     <thead>
                        <tr>
                           <th className='pr-8 py-8'>Name</th>
                           {Object.keys(list[0]?.expressions || {}).map(key => (
                              <th className='pr-8 py-8' key={key}>{key} </th>
                           ))}
                        </tr>
                     </thead>
                     <tbody>
                        {list.map((atn, index) => (
                           <tr key={index}>
                              <td>{atn.student.name}</td>
                              {Object.keys(atn.expressions).map(key => (
                                 <td key={key}>{round(atn.expressions[key] * 100)}</td>
                              ))}
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         }
      </div>
   );
};

export default AllStudent;
