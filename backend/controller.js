import { Student, StudentAttendance } from "./models.js"

export const addStudent = async (req, res) => {
   try {

      const { rollno, name, descriptors } = req.body

      const userexist = await Student.findOne({ rollno })
      if (userexist) {
         const student = await Student.findByIdAndUpdate(userexist._id, { $push: { descriptors: { $each: descriptors } } })
         console.log("updated", student.name)
         res.status(200).json({ msg: "student updated" })
      } else {
         const student = await Student.create({
            name,
            rollno,
            descriptors
         })
         console.log("created", student.name)
         res.status(200).json({ msg: "student added" })
      }
   } catch (err) {
      console.log(err)
   }
}

export const getStudents = async (req, res) => {
   try {
      const students = await Student.find({})
      res.status(200).json(students)
   } catch (err) {
      console.log(err)
   }
}

export const setAttendance = async (req, res) => {
   try {
      const date = new Date();
      let day = date.getDate();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();
      let currentDate = `${day}-${month}-${year}`;

      const { rollno, expressions } = req.body
      const student = await Student.findOne({ rollno })
      const attendance = await StudentAttendance.findOne({ $and: [{ student: student._id }, { date: currentDate }] })
      if (!attendance) {
         const attendance = await StudentAttendance.create({
            student: student._id,
            date: currentDate,
            expressions
         })
         res.status(200).json("attendance set")
      } else {
         res.json("attendance exist")
      }
   } catch (err) {
      console.log(err)
   }
}


export const getAttendance = async (req, res) => {
   try {
      const attendance = await StudentAttendance.find().populate("student")
      res.status(200).json(attendance)
   } catch (err) {
      console.log(err)
   }
}

export const getStudentAttendance = async (req, res) => {
   try {
      const rollno = req.params.rollno
      const student = await Student.findOne({ rollno })
      const attendance = await StudentAttendance.find({ student: student._id })
      res.status(200).json(attendance)
   } catch (err) {
      console.log(err)
   }
}




