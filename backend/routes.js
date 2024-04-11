import { Router } from "express";
import { addStudent, getAttendance, getStudentAttendance, getStudents, setAttendance } from "./controller.js";

const router = Router()

router.route("/addStudent").post(addStudent)
router.route("/getStudents").get(getStudents)
router.route("/setAttendance").post(setAttendance)
router.route("/getAttendance").get(getAttendance)
router.route("/getStudentAttendance/:rollno").get(getStudentAttendance)


export default router