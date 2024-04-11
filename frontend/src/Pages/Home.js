import React from 'react'
import BackgroundVideo from '../Pages/BackgroundVideo'
import { MdOutlineArrowCircleRight } from "react-icons/md";
import { Link } from 'react-router-dom';
const Home = () => {
   return (
      <div className='text-white'>
         <BackgroundVideo />
         <div className='p-5'>
            <div className='flex items-center'>
               <img className='w-[64px] h-[64px]' src={require("../utils/logo.png")} alt='logo' />
               <div className='text-[60px] font-semibold'><span className='text-blue-500'>i</span>Face</div>
            </div>
            <div className='p-5 mt-16'>
               <div className='text-[60px] text-blue-500 font-semibold w-[700px]' >Facial & Expression Recognition</div>
               <div className='text-[20px] text-wrap w-[700px]' >Student Attendance System with Facial Recognition and Expression</div>
               <Link to="/face" className='bg-blue-500 py-2 px-4 mt-8 rounded-[24px] flex items-center gap-4 text-[24px] font-semibold w-fit'>Start <span className='text-[34px]'><MdOutlineArrowCircleRight /></span></Link>
            </div>
         </div>
      </div>
   )
}

export default Home