// server.js
import express from 'express';
import cors from 'cors';
import { engine } from 'express-handlebars';
import path from 'path';
import { fileURLToPath } from 'url';

import {
    initDb,
    dbConnection,
    fetchAllStudents,
    fetchStudentsByCourse,
    fetchStudentById,
    fetchTeachingAssistants,
    fetchAllCourses,
    fetchCourseById,
    createStudent,
    modifyStudent,
    createCourse,
    modifyCourse,
    removeCourseById,
} from './modules/collegeData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 8000;
const app = express();

app.engine('.hbs', engine({ extname: '.hbs' }));
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Database and Start Server
initDb()
    .then(() => {
        console.log('Database initialized successfully.');
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Database initialization failed:', error);
    });

// Authenticate Database Connection
dbConnection.authenticate()
    .then(() => {
        console.log('Database connection established.');
    })
    .catch((error) => {
        console.error('Failed to connect to the database:', error);
    });

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'home.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

app.get('/htmlDemo', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'htmlDemo.html'));
});

app.get('/student', (req, res) => {
    res.render('addStudent');
});

app.get('/course', (req, res) => {
    res.render('addCourse');
});

// Student Routes
app.get('/students', (req, res) => {
    const course = req.query.course;
    const fetchStudents = course ? fetchStudentsByCourse(course) : fetchAllStudents();

    fetchStudents
        .then((students) => res.json(students))
        .catch((err) => res.json({ message: err }));
});

app.get('/tas', (req, res) => {
    fetchTeachingAssistants()
        .then((tas) => res.json(tas))
        .catch((err) => res.json({ message: 'No results' }));
});

app.get('/student/:studentNum', (req, res) => {
    let viewData = {};

    fetchStudentById(req.params.studentNum)
        .then((data) => {
            viewData.student = data || null;
        })
        .catch(() => {
            viewData.student = null;
        })
        .then(fetchAllCourses)
        .then((data) => {
            viewData.courses = data;

            if (viewData.student) {
                viewData.courses.forEach((course) => {
                    if (course.courseId === viewData.student.course) {
                        course.selected = true;
                    }
                });
            }
        })
        .catch(() => {
            viewData.courses = [];
        })
        .then(() => {
            if (viewData.student === null) {
                res.status(404).send('Student Not Found');
            } else {
                res.render('student', { viewData });
            }
        });
});

app.get('/student/add', (req, res) => {
    fetchAllCourses()
        .then((courses) => res.render('addStudent', { courses }))
        .catch((err) => {
            console.error(err);
            res.render('addStudent', { courses: [err] });
        });
});

// Course Routes
app.get('/courses/:num', (req, res) => {
    fetchStudentsByCourse(req.params.num)
        .then((data) => res.json(data))
        .catch((err) => res.json({ message: err }));
});

app.post('/courses/add', (req, res) => {
    createCourse(req.body)
        .then(() => res.redirect('/courses'))
        .catch(() => res.status(500).send('Unable to add course'));
});

app.post('/course/update', (req, res) => {
    modifyCourse(req.body)
        .then(() => res.redirect('/courses'))
        .catch(() => res.status(500).send('Unable to update course'));
});

app.get('/course/delete/:id', (req, res) => {
    removeCourseById(req.params.id)
        .then(() => res.redirect('/courses'))
        .catch(() => res.status(500).send('Unable to remove course'));
});
