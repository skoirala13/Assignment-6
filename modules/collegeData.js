// db.js
import path from 'path';
import { fileURLToPath } from 'url';
import { Sequelize } from 'sequelize';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PGHOST = 'ep-little-cloud-a5idb822.us-east-2.aws.neon.tech';
const PGDATABASE = 'SenecaDB';
const PGUSER = 'SenecaDB_owner';
const PGPASSWORD = 'Mzc8RQ1hnwgs';

const sequelize = new Sequelize(PGDATABASE, PGUSER, PGPASSWORD, {
  host: PGHOST,
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
    ssl: { rejectUnauthorized: false },
  },
  query: { raw: true },
});

const Student = sequelize.define('Student', {
  studentNum: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  firstName: Sequelize.STRING,
  lastName: Sequelize.STRING,
  email: Sequelize.STRING,
  addressStreet: Sequelize.STRING,
  addressCity: Sequelize.STRING,
  addressProvince: Sequelize.STRING,
  TA: Sequelize.BOOLEAN,
  status: Sequelize.STRING,
});

const Course = sequelize.define('Course', {
  courseId: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  courseCode: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  courseDescription: Sequelize.STRING,
});

Course.hasMany(Student, { foreignKey: 'course' });

function initialize() {
  return new Promise((resolve, reject) => {
    sequelize.sync()
      .then(() => resolve())
      .catch((err) => reject('Unable to sync the database'));
  });
}

function getAllStudents() {
  return new Promise((resolve, reject) => {
    Student.findAll()
      .then((data) => {
        console.log(data);
        resolve(data);
      })
      .catch((err) => reject('No results returned'));
  });
}

function getTAs() {
  return new Promise((resolve, reject) => {
    Student.findAll({ where: { TA: true } })
      .then((data) => resolve(data))
      .catch((err) => reject('No results returned'));
  });
}

function getStudentByCourse(course) {
  return new Promise((resolve, reject) => {
    Student.findAll({ where: { course } })
      .then((data) => resolve(data))
      .catch((err) => reject('No results returned'));
  });
}

function getStudentByNum(num) {
  return new Promise((resolve, reject) => {
    Student.findOne({ where: { studentNum: num } })
      .then((data) => resolve(data))
      .catch((err) => reject('No results returned'));
  });
}

function deleteStudentByNum(studentNum) {
  return new Promise((resolve, reject) => {
    Student.destroy({ where: { studentNum } })
      .then(() => resolve())
      .catch((err) => reject('Unable to remove student / student not found'));
  });
}

function getCourses() {
  return new Promise((resolve, reject) => {
    Course.findAll()
      .then((data) => resolve(data))
      .catch((err) => reject('No results returned'));
  });
}

function getCourseById(id) {
  return new Promise((resolve, reject) => {
    Course.findOne({ where: { courseId: id } })
      .then((data) => resolve(data))
      .catch((err) => reject('No results returned'));
  });
}

function addStudent(studentData) {
  studentData.TA = studentData.TA ? true : false;
  for (const prop in studentData) {
    if (studentData[prop] === '') studentData[prop] = null;
  }

  return new Promise((resolve, reject) => {
    Student.create(studentData)
      .then(() => resolve())
      .catch((err) => reject('Unable to create student'));
  });
}

function updateStudent(studentData) {
  studentData.TA = studentData.TA ? true : false;
  for (const prop in studentData) {
    if (studentData[prop] === '') studentData[prop] = null;
  }

  return new Promise((resolve, reject) => {
    Student.update(studentData, { where: { studentNum: studentData.studentNum } })
      .then(() => resolve())
      .catch((err) => reject('Unable to update student'));
  });
}

function addCourse(courseData) {
  for (const prop in courseData) {
    if (courseData[prop] === '') courseData[prop] = null;
  }

  return new Promise((resolve, reject) => {
    Course.create(courseData)
      .then(() => resolve())
      .catch((err) => reject('Unable to create course'));
  });
}

function updateCourse(courseData) {
  for (const prop in courseData) {
    if (courseData[prop] === '') courseData[prop] = null;
  }

  return new Promise((resolve, reject) => {
    Course.update(courseData, { where: { courseId: courseData.courseId } })
      .then(() => resolve())
      .catch((err) => reject('Not able to update course'));
  });
}

function deleteCourseById(id) {
  return new Promise((resolve, reject) => {
    Course.destroy({ where: { courseId: id } })
      .then(() => resolve())
      .catch((err) => reject('Unable to delete course'));
  });
}

export {
  initialize,
  getAllStudents,
  getTAs,
  getStudentByCourse,
  getStudentByNum,
  deleteStudentByNum,
  getCourses,
  getCourseById,
  addStudent,
  updateStudent,
  addCourse,
  updateCourse,
  deleteCourseById,
  sequelize,
};
