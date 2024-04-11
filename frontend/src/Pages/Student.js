import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { useLocation } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';
import { getStudentAttendanceRoute } from '../utils/ApiRoutes';

Chart.register(...registerables);

const Student = () => {
   const location = useLocation()
   const { student } = location.state
   const monthlist = ["January", "February", "March", "April", "May", "June", "July", "August", 'September', 'October', 'November', "December"]
   const [todayDate, setTodayDate] = useState("")
   const [value, onChange] = useState(new Date());
   const [selectedDate, setSeletedDate] = useState("")
   const [attendance, setAttendance] = useState([]);
   const [attendanceToday, setAttendanceToday] = useState([])
   const [attendanceAtDate, setAttendanceAtDate] = useState([])
   const [attendanceAtWeek, setAttendanceAtWeek] = useState([])
   const [attendanceAtMonth, setAttendanceAtMonth] = useState([])
   const [weekExpression, setWeekExpression] = useState([])
   const [monthExpression, setMonthExpression] = useState([])

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
      const attendanceTodayData = attendance?.filter(atn => atn.date === todayDate)[0]
      setAttendanceToday(attendanceTodayData)
   }, [attendance, todayDate])

   useEffect(() => {
      const attendanceAtDateData = attendance?.filter(atn => atn.date === selectedDate)[0]
      setAttendanceAtDate(attendanceAtDateData)
   }, [attendance, selectedDate])

   useEffect(() => {
      const attendanceAtWeekData = attendance?.filter(atn => atn.date.split("-")[0] >= selectedDate.split("-")[0] - 7 && atn.date.split("-")[0] <= selectedDate.split("-")[0])
      setAttendanceAtWeek(attendanceAtWeekData)
   }, [attendance, selectedDate])

   useEffect(() => {
      const attendanceAtMonthData = attendance?.filter(atn => atn.date.split("-")[1] === selectedDate.split("-")[1])
      setAttendanceAtMonth(attendanceAtMonthData)
   }, [attendance, selectedDate])

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

   const getAttendance = async () => {
      try {
         const response = await axios.get(`${getStudentAttendanceRoute}/${student.rollno}`)
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
         <h1 className="text-3xl font-bold mb-4">{student.name} {student.rollno}</h1>
         <div className="flex flex-col gap-4">
            <div className='flex gap-4'>
               <div className='bg-gray-900 p-4 rounded-[12px]  text-center w-full'>
                  <h2 className="text-2xl font-bold mb-2">Attendance Today</h2>
                  <p className="text-3xl font-bold mt-16 text-blue-600">{attendanceToday ? "Present" : "Absent"}</p>
               </div>
               <div className='bg-gray-900 p-4 rounded-[12px]  text-center w-full'>
                  <h2 className="text-2xl font-bold mb-2">Total Attendance</h2>
                  <p className="text-3xl font-bold mt-16 text-blue-600">{attendance.length}</p>
               </div>
               <div className="bg-gray-900 p-4 rounded-[12px]  w-full">
                  <h2 className="text-xl font-bold mb-2">Expression at Today</h2>
                  <Bar data={{
                     labels: attendanceToday?.expressions && Object.keys(attendanceToday?.expressions),
                     color: "#fff",
                     datasets: [{
                        label: 'Expression Today',
                        data: attendanceToday?.expressions && Object.values(attendanceToday?.expressions),
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
                  <p className="text-3xl font-bold mt-16 text-blue-600">{attendanceAtDate ? "Present" : "Absent"}</p>
               </div>
               <div className='bg-gray-900 p-4 rounded-[12px]  text-center w-full'>
                  <h2 className="text-2xl font-bold mb-2">Total Attendance in {monthlist[selectedDate.split("-")[1] - 1]}</h2>
                  <p className="text-3xl font-bold mt-16 text-blue-600">{attendanceAtMonth.length}</p>
               </div>
               <div className="bg-gray-900 p-4 rounded-[12px] w-full">
                  <h2 className="text-xl font-bold mb-2">Expression at {selectedDate}</h2>
                  <Bar data={{
                     labels: attendanceAtDate?.expressions && Object.keys(attendanceAtDate?.expressions),
                     color: "#fff",
                     datasets: [{
                        label: 'Expression',
                        data: attendanceAtDate?.expressions && Object.values(attendanceAtDate?.expressions),
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
      </div>
   );
};

export default Student;
