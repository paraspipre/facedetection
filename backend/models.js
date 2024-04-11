import mongoose from 'mongoose';

const studentAttendanceSchema = new mongoose.Schema({
   student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
   date: { type: String },
   expressions: {} 
}, {
   timestamps:true
});

const studentSchema = new mongoose.Schema({
   name: { type: String, required: true },
   rollno: { type: Number, required: true,unique:true },
   descriptors: [{}]
});

export const Student = mongoose.model('Student', studentSchema);
export const StudentAttendance = mongoose.model('StudentAttendance', studentAttendanceSchema);


