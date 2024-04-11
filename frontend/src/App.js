import './App.css';
import {BrowserRouter, Route, Routes} from "react-router-dom"
import FaceDetection from './Pages/FaceDetection.js'
import Home from './Pages/Home.js';
import Student from './Pages/Student.js';
import AllStudent from './Pages/AllStudent.js';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/face" element={<FaceDetection />} />
        <Route path="/student" element={<Student />} />
        <Route path="/allstudent" element={<AllStudent />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
