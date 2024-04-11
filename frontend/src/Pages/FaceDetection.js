import React, { useState, useRef, useEffect } from "react";
import * as faceapi from "face-api.js";
import { loadImage } from 'canvas';
import axios from "axios";
import { addStudentRoute, getAttendanceRoute, getStudentsRoute, setAttendanceRoute } from "../utils/ApiRoutes";
import { IoIosImages } from "react-icons/io";
import { Link } from "react-router-dom";

const FaceDetection = ({ data, available }) => {
   const videoRef = useRef();
   const canvasRef = useRef();
   const [Students, setStudents] = useState([])
   const [Attendance, setAttendance] = useState([])
   const [videostart, setVideostart] = useState(false)

   const dimensions = {
      width: 800,
      height: 600,
   };
   const minConfidence = 0.7;

   const start = () => {
      loadModels();
      getVideo();
   }

   useEffect(() => {
      getAttendance();
   },[])
   
   useEffect(() => {
      getStudents()
   },[])

   let detectionInterval;
   const detect = async () => {
      try {
         detectionInterval = setInterval(async () => {
            const detection = videostart && await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
               .withFaceLandmarks(true)
               .withFaceExpressions()
               .withFaceDescriptor();

            if (detection) {
               const resizedDetections = faceapi.resizeResults(detection, dimensions);
               const { expressions, descriptor } = resizedDetections;
               showDetections(resizedDetections);

               let bestDistance = Number.MAX_VALUE;
               let bestMatchIndex = -1;

               for (let i = 0; i < Students.length; i++) {
                  for (let j = 0; j < Students[i].descriptors.length; j++) {
                     const studentdesc = Object.keys(Students[i].descriptors[j]).map(val => Students[i].descriptors[j][val])
                     const distance = euclideanDistance(descriptor, studentdesc);
                     if (distance < bestDistance) {
                        bestDistance = distance;
                        bestMatchIndex = i;
                     }
                  }
               }

               if (bestMatchIndex !== -1) {
                  const name = Students[bestMatchIndex].name
                  const rollno = Students[bestMatchIndex].rollno
                  const result = { name, rollno }
                  showDetections(resizedDetections, result);
                  
                  const response = Attendance.filter(atn => atn.student.rollno === result.rollno).length===0 && await axios.post(setAttendanceRoute, { rollno: result.rollno, expressions })
                  if (response) {
                     getAttendance()
                  }
               } else {
                  console.log("no match found")
               }
            }
         }, 2000);
      } catch (err) {
         console.log(err)
      }
   };

   const loadModels = async () => {
      const url = "../../models";
      const models = [
         faceapi.nets.ssdMobilenetv1,
         faceapi.nets.tinyYolov2,
         faceapi.nets.tinyFaceDetector,
         faceapi.nets.faceExpressionNet,
         faceapi.nets.faceLandmark68TinyNet,
         faceapi.nets.faceLandmark68Net,
         faceapi.nets.faceRecognitionNet
      ];
      await Promise.all(models.map(model => model.loadFromUri(url)));
      console.log("Models loaded");
   };

   const getVideo = () => {
      navigator.mediaDevices
         .getUserMedia({ video: dimensions })
         .then((stream) => {
            videoRef.current.srcObject = stream;
         })
         .catch((err) => {
            console.error("error:", err);
         });
      setVideostart(true)
   };

   const getStudents = async () => {
      try {
         const response = await axios.get(getStudentsRoute)
         if (response) {
            setStudents(response.data)
            console.log(response.data)
         }
      } catch (err) {
         console.log(err)
      }
   }

   const getAttendance = async () => {
      try {
         const date = new Date();
         let day = date.getDate();
         let month = date.getMonth() + 1;
         let year = date.getFullYear();
         let currentDate = `${day}-${month}-${year}`;
         const response = await axios.get(getAttendanceRoute)
         if (response) {
            const data = response?.data?.filter(atn => atn.date === currentDate)
            setAttendance(data)
            console.log(response.data)
         }
      } catch (err) {
         console.log(err)
      }
   }

   const handleAddStudent = async (e) => {
      e.preventDefault()
      const name = e.target.name.value
      const rollno = e.target.rollno.value
      const descriptions = await Promise.all([...Array(e.target.image.files.length)].map(async (_, i) => {
         const img = await loadImage(URL.createObjectURL(e.target.image.files[i]));
         const detection = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks(true)
            .withFaceExpressions()
            .withFaceDescriptor();
         return new Float32Array(detection?.descriptor)
      }));
      const refFace = new faceapi.LabeledFaceDescriptors(name, descriptions)
      const faceMatcher = new faceapi.FaceMatcher(refFace, minConfidence);
      const descriptors = faceMatcher.labeledDescriptors[0].descriptors

      const response = await axios.post(addStudentRoute, { rollno, name, descriptors })
      getStudents()
   }

   const showDetections = (resizedDetections, result) => {
      const minProbability = 0.05;
      faceapi.matchDimensions(canvasRef.current, dimensions);
      canvasRef.current.getContext("2d").clearRect(0, 0, dimensions.width, dimensions.height);
      faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
      faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);
      faceapi.draw.drawFaceExpressions(canvasRef.current, resizedDetections, minProbability);
      const options = { label: result ? `${result?.name} ${result?.rollno}` : "Analyzing Face", lineWidth: 3 };
      const drawBox = new faceapi.draw.DrawBox(resizedDetections.detection.box, options);
      drawBox.draw(canvasRef.current);
   };

   function euclideanDistance(arr1, arr2) {
      const desc1 = Array.from(arr1)
      const desc2 = Array.from(arr2)

      return Math.sqrt(
         desc1
            .map((val, i) => val - desc2[i])
            .reduce((res, diff) => res + Math.pow(diff, 2), 0)
      )
   }

   function stop() {
      window.location.reload()
   }

   const reload = () => {
      window.location.reload()
      setTimeout(() => { start() },1000)
   }

   return (
      <div className="flex h-screen w-full text-white p-4">
         <div className="flex flex-col items-center justify-center w-[70%] ">
            {videostart ? <div className="w-full h-[90%] rounded-lg relative ">
               <video className="w-full h-full rounded-lg absolute top-0 right-0" autoPlay muted ref={videoRef} onPlay={detect} />
               <canvas className="absolute top-10 right-10" ref={canvasRef} />
            </div> :
               <img src={require("../utils/logo.png")} alt="pt" />
            }
            <div className="flex gap-4">
               {!videostart &&<button onClick={start} className='bg-blue-800 py-2 px-8 mt-4 rounded-[24px] flex items-center gap-4 text-[20px]  w-fit'>Start</button>}
               {videostart &&<button onClick={reload} className='bg-blue-800 py-2 px-8 mt-4 rounded-[24px] flex items-center gap-4 text-[20px]  w-fit'>Reload</button>}
               {videostart && <button onClick={stop} className='bg-red-600 py-2 px-8 mt-4 rounded-[24px] flex items-center gap-4 text-[20px]  w-fit'>Stop</button>}
               <Link to="/allstudent" className='bg-blue-800 py-2 px-8 mt-4 rounded-[24px] flex items-center gap-4 text-[20px]  w-fit'>All Student Analysis</Link>
            </div>
         </div>
         <div className="flex flex-col gap-4 w-[30%]  text-white rounded-lg">
            <div className="flex flex-col w-full">
               <div className="mb-4 text-lg font-bold">Add Student</div>
               <form onSubmit={(e) => handleAddStudent(e)} className="flex flex-col space-y-2">
                  <input type="text" name="name" placeholder="Name" className="p-2 bg-gray-800 rounded-lg text-white focus:outline-none" />
                  <input type="text" name="rollno" placeholder="Roll No." className="p-2 bg-gray-800 rounded-lg text-white focus:outline-none" />
                  <input type="file" name="image" multiple hidden id="imageinput" className="p-2 bg-gray-800 rounded-lg text-white" />
                  <div className="flex w-full gap-4">
                     <button onClick={() => { document.getElementById("imageinput").click() }} className=" w-full text-center flex flex-col items-center justify-center text-[24px] py-1  bg-blue-700 rounded-full text-white hover:bg-blue-600 transition duration-300"><IoIosImages /></button>
                     <button type="submit" className=" w-full bg-blue-700 rounded-full text-white hover:bg-blue-600 transition duration-300 font-semibold">Add</button>
                  </div>
               </form>
            </div>
            <div className="flex flex-col w-full">
               <h2  className="mb-2 text-lg font-bold flex gap-4 items-center">Students Present</h2>
               <div className="overflow-y-auto max-h-52 no-scrollbar">
                  {Attendance.map((attendance, index) => (
                     <div key={index} className="bg-gray-700 p-2 mb-2 rounded-lg">
                        <Link to="/student" state={{ student: attendance.student }} className="w-full" >{attendance.student.name} {attendance.student.rollno}</Link>
                     </div>
                  ))}
               </div>
            </div>
            <div className="flex flex-col w-full">
               <h2  className="mb-2 text-lg font-bold flex gap-4 items-center">Total Students</h2>
               <div className="overflow-y-auto max-h-52 no-scrollbar">
                  {Students.map((student, index) => (
                     <div key={index} className="bg-gray-700 p-2 mb-2 rounded-lg">
                        <Link to="/student" state={{ student }} >{student.name} {student.rollno}</Link>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
   );
};

export default FaceDetection;