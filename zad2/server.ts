import express = require('express');
import session = require('express-session');
import SQLiteStoreCreator = require('connect-sqlite3');
let SQLiteStore = SQLiteStoreCreator(session);
import csurf = require('csurf');
import sqlite3 = require('sqlite3');
sqlite3.verbose();
import { promisify } from 'util';
import bodyParser = require('body-parser')

const app = express()
app.set('view engine', 'pug')
app.use(express.urlencoded({extended: true})); 
app.use(bodyParser.json())
app.use(session({resave: false, 
                 saveUninitialized: false,
                 store: new SQLiteStore,
                 secret: "vAiUamCztn0iUQOL5ymUAeHiBHwqmttMVqXj34qqHeCk57C4I1WVYZavB8i0nxWpOlvWT4ox7oHu1BgSmDJdJfhsSBwBt8OZuFKWeXmFEGTZQwnpZcxX8ced6PZbQE29uz5HEgpHfhE2yqWrcQPJ41BCjwO7Ruomb2lpKkUHYZAgZ0T7JRoQSiqZUGWVHKIegM1lnmDRMNh931ubtyB1gsxmALp6mksxdWjoTrsy1zcaRB1r9pnckXi2ZlSRcE2NwyM81O4m0PnnlFchVdXQ9Em9fqav3D8dG33M77OdJGCuHjAjAF0gwKGx1ik15akwhenWraNC0s7abV4rSflbHm7nskRuhVEfUzhOWoRhjwDFqE2E7SgEgUmKjX9gJOesadPVTZXDfLvPvS2Zj6z8K99rQBPkS5IXwfjuDUJJLIJDN52U97iQHfGn3b7By04xfpgZOTfo37YWIHyYBh4dhD8jIHH90qUf5dzaVDjSfoucttjez7ysuV5CZQMpXd4hXHQ7b7G5mjpCHEtLo0dcY2vsiG7zjKn9RcboihrnI2fWhxhAkWXyt7UorhIF6RFKPPASohZnf2YOBZunU01JijOEgCKQYddvKjtsGHevaQ3rcZ8tIjtwDCm1qNtY7mXLxuUp8l20f4vXNEfvxY1UHp07fYrdYWBollGcsGiLwbSiJMutgSF1HCiHmtrU32V6YLHoMkxMfYAeXMDoF5YOCxFyqwAXx0K8Mq2jdraA6JKI4K0DAMTtB1MDaPSLkSHvzLzbwqhRRnFsHB2PlCw6qJLw6VZxvyS8ed5OuFvTuIz8Z2iqhDWnLAIFvuDRmtgJE0p3ctTixwuYsxDilScUbnt047Xm91axH8rMSY8osEmTOomgxb3w6bGB96vY2M5pX8d8ojVhGlyOkgW4kdWXByktRjXcvg1Rvi2zmryR1g7KTYunoIAHKMeyggbyZ0oVo5V76tZEWSaQVdRYRDbX8M0b00xEj9DE7kedFFP3wZgxnSiam28oRsHBbg8u24Bi"
                }));
// app.use(csurf({cookie: false}));

let server_port = 3000;

class QuizTask
{
    public question: string;
    public answer: number;
    public penalty: number;
}

class Quiz
{
    public id: number;
    public tasks: QuizTask[];
    public start_time: number;
}

function get_quiz_from_json(quiz_json: JSON): Quiz
{
    return <Quiz>(quiz_json as any);
}

class QuizAnswers
{
    answers: number[];
    question_time_percentages: number[];
    question_times_ms: number[];
    total_time_ms: number;
}

function get_quiz_answers_from_json(answers_json: JSON) : QuizAnswers
{
    return <QuizAnswers>(answers_json as any);
}


let db = new sqlite3.Database('quiz_server.db');

function is_logged_in(session): boolean
{
    if(session.username)
        return true;
    else
        return false;
}

let require_user_login = (req, res, next) =>
{
    if (req.session.username)  {
        next();
    } else {
        res.redirect(303, '/login')
    }
};

function verify_user(username: string, password: string): Promise<boolean>
{
    return new Promise((resolve) => 
    {
        db.get('SELECT username from users where username = ? AND password = ?',
                username, password, (err, row) =>
        {
            if(row) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    });
}

function change_user_password(username: string, new_password: string): Promise<void>
{
    return new Promise((resolve, reject) => 
    {
        db.run('UPDATE users SET password = ? WHERE username = ?', new_password, username, (err) => 
        {
            if(err)
            {
                console.log(err);
                reject();
            }
            else
                resolve();
        });
    });
}

function get_all_quizzes(): Promise<Quiz[]>
{
    return new Promise((resolve) => 
    {
        db.all('SELECT quiz_id, quiz_json FROM quizzes', (err, rows) => 
        {
            let result: Quiz[] = [];

            for(let row of rows)
            {
                result.push(get_quiz_from_json(JSON.parse(row.quiz_json)));
            }

            resolve(result);
        });
    });
}

function get_quiz_by_id(quiz_id: number): Promise<Quiz>
{
    return new Promise((resolve) => 
    {   
        db.get('SELECT quiz_id, quiz_json FROM quizzes WHERE quiz_id = ?', quiz_id, (err, row) => 
        {
            if(row) {
                resolve(get_quiz_from_json(JSON.parse(row.quiz_json)));
            } else {
                resolve(null);
            }
        })
    });
}

function get_quiz_start_time(quiz_id: number, username: string): Promise<number>
{
    return new Promise((resolve) => 
    {   
        db.get('SELECT start_time FROM quiz_start_times WHERE quiz_id = ? AND username = ?', quiz_id, username, 
        (err, row) => 
        {
            if(row)
                resolve(row.start_time);
            else
                resolve(null);
        });
    });
}

function set_quiz_start_time(quiz_id: number, username: string): Promise<void>
{
    let ms_since_epoch: number = (new Date()).getTime();

    return new Promise((resolve, reject) => 
    {
        db.run('INSERT INTO quiz_start_times VALUES (?, ?, ?)', username, quiz_id, ms_since_epoch, (err) => 
        {
            if(err)
            {
                console.log(err);
                reject();
            }
            else
                resolve();
        });
    });
};

async function get_user_answers_for_quiz(quiz_id: number, username: string): Promise<QuizAnswers>
{
    let result: QuizAnswers = new QuizAnswers();
    result.answers = [];
    result.total_time_ms = 1e18;
    result.question_times_ms = [];

    // Retrieve answers
    await new Promise((resolve) => 
    {
        db.all('SELECT answer, time_ms FROM quiz_answers WHERE username = ? AND quiz_id = ? ORDER BY quiz_id', username, quiz_id, 
        (err, rows) =>
        {
            if(rows)
            {
                for(let row of rows)
                {
                    result.answers.push(row.answer);
                    result.question_times_ms.push(row.time_ms);
                }
            }
        });

        resolve();
    });

    // Retrieve quiz time
    await new Promise((resolve) => 
    {   
        db.get('SELECT time_ms FROM quiz_times WHERE username = ? AND quiz_id = ?', username, quiz_id, (err, row) => {
            if(row)
                result.total_time_ms = row.time_ms;

            resolve();
        })
    });

    if(result.answers.length > 0)
        return result;
    else
        return null;
}

function set_user_answers_for_quiz(quiz_id: number, username: string, answers: QuizAnswers)
{
    db.run('INSERT INTO quiz_times VALUES (?, ?, ?)', username, quiz_id, answers.total_time_ms);
    // Insert question answers and times
    for(let i: number = 0; i < answers.answers.length; i++)
    {
        let cur_time: number = answers.question_time_percentages[i]/100.0 * answers.total_time_ms;

        db.run('INSERT INTO quiz_answers VALUES (?, ?, ?, ?, ?)', username, quiz_id, i, answers.answers[i], cur_time);
    }
}

function get_top_results_for_quiz(quiz_id: number): Promise<[string, string][]>
{
    let result: [string, string][] = [];

    return new Promise((resolve) =>
    {
        db.all('SELECT username, time_ms FROM quiz_times WHERE quiz_id = ? ORDER BY time_ms', quiz_id, (err, rows) => 
        {
            for(let row of rows)
            {
                if(result.length === 5)
                    break;

                result.push([millis_as_string(row.time_ms), row.username]);
            }

            resolve(result);
        });
    });
}

function get_average_question_time(quiz_id: number, question_num: number): Promise<number>
{
    return new Promise((resolve) => 
    {
        db.get('SELECT AVG(time_ms) avg_time FROM quiz_answers WHERE quiz_id = ? AND question_id = ?;', quiz_id, question_num,
        (err, row) =>
        {
            if(row)
                resolve(row.avg_time);
            else
                resolve(null);
        });
    });
}

app.get('/', (req, res) => {
    res.redirect(303, '/quizzes');
});

// Show the list of quizzes
// If the user is not logged in then redirect to login
// If the user is logged in then show list of quizzes
app.get('/quizzes', require_user_login, async (req, res) => 
{
    let username: string = req.session.username;

    let quizzes: Quiz[] = await get_all_quizzes();

    // Show list of quizzes
    // Each quiz can be in one of 3 states
    // 1. Not attempted - show button to start solving
    // 2. In progresss - show button to continue solving
    // 3. Done - show button to review results

    let quizzes_data: [number, string][] = [];
    for(let i = 0; i < quizzes.length; i++)
    {
        let quiz_id: number = quizzes[i].id;

        if(await get_user_answers_for_quiz(quizzes[i].id, username))
            quizzes_data.push([quiz_id, "Solved"])
        else if(await get_quiz_start_time(quizzes[i].id, username))
            quizzes_data.push([quiz_id, "In progress"])
        else
            quizzes_data.push([quiz_id, "Not attempted"])
    }

    res.render('quizzes', {quizzes_data: quizzes_data, username: username});
});

// Login page - simple form that does POST /login
app.get('/login', (req, res) => 
{
    res.render('login', {username: req.session.username});
});

app.post('/login', async (req, res) => 
{
    if(await verify_user(req.body.username, req.body.password))
    {
        req.session.username = req.body.username;
        res.redirect(303, '/quizzes');
    }
    else
        res.redirect(303, '/login');
});

app.get('/logout', require_user_login, async (req, res) => 
{
    req.session.username = undefined;
    res.redirect(303, '/login');
})

app.get('/resetpassword', require_user_login, async (req, res) => 
{
    res.render('reset_password', {username: req.session.username});
});

app.post('/resetpassword', require_user_login, async (req, res) =>
{
    let password1: string = req.body.password1;
    let password2: string = req.body.password2;

    if(password1 != password2)
        res.redirect(303, '/resetpassword');

    await change_user_password(req.session.username, password1);

    res.redirect(303, '/quizzes');
});

// Returns page for solving this quiz
app.get('/quiz/:quiz_id', require_user_login, async (req, res) => 
{   
    let username: string = req.session.username;
    let quiz_id: number = req.params.quiz_id;

    if(await get_user_answers_for_quiz(quiz_id, username))
    {
        res.redirect(303, '/quiz/' + quiz_id + '/results');
        return;
    }

    let quiz: Quiz = await get_quiz_by_id(quiz_id);
    
    if(quiz)
        res.render('quiz', {quiz_id: quiz_id, username: username});
    else
        res.redirect(303, '/quizzes');
}); 

// Returns data of a given quiz in json
app.get('/quiz/:quiz_id/data', require_user_login, async (req, res) =>
{
    let username: string = req.session.username;
    let quiz_id: number = req.params.quiz_id;

    if(await get_user_answers_for_quiz(quiz_id, username))
    {
        res.redirect(303, '/quiz/' + quiz_id + '/results');
        return;
    }

    let quiz_start_time: number = await get_quiz_start_time(quiz_id, username);

    if(quiz_start_time === null)
    {
        await set_quiz_start_time(quiz_id, req.session.username);
    }

    let quiz: Quiz = await get_quiz_by_id(quiz_id);

    if(quiz)
    {
        quiz.start_time = quiz_start_time;

        // Censor answers
        for(let task of quiz.tasks)
        {
            task.answer = 0;
        }
        
        res.json(quiz);
    }
    else
        res.render('404', {username: username});
});

// Frontend uses this post to submit quiz results
app.post('/quiz/:quiz_id/answers', require_user_login, async (req, res) =>
{
    let quiz_id: number = req.params.quiz_id;
    let username: string = req.session.username;

    let quiz_answers: QuizAnswers = get_quiz_answers_from_json(req.body);

    let quiz_submit_time: number = (new Date()).getTime();
    let quiz_start_time: number = await get_quiz_start_time(quiz_id, username);

    let quiz_time: number = quiz_submit_time - quiz_start_time;

    if(await get_user_answers_for_quiz(quiz_id, username))
    {
        res.redirect(303, '/quiz/' + quiz_id + '/results');
        return;
    }

    let quiz: Quiz = await get_quiz_by_id(quiz_id);

    // Calculate results
    quiz_answers.total_time_ms = quiz_time;
    for(let i: number = 0; i < quiz.tasks.length; i++)
        if(quiz_answers.answers[i] != quiz.tasks[i].answer)
            quiz_answers.total_time_ms += quiz.tasks[i].penalty * 1000;

    await set_user_answers_for_quiz(quiz_id, req.session.username, quiz_answers);

    res.redirect(303, '/quiz/' + quiz_id + '/results');
});

function millis_as_string(time_in_ms: number): string
{
    let seconds: number = Math.floor(time_in_ms/1000) % 60;
    let minutes: number = Math.floor(time_in_ms/1000/60) % 60;
    let hours: number = Math.floor(time_in_ms/1000/60/60);

    let result = seconds + "." + Math.floor((time_in_ms % 1000)/100) + "s";
    if(minutes > 0)
        result = minutes + "m " + result;

    if(hours > 0)
        result = hours + "h " + result;

    return result;
}

// Shows page with quiz results
app.get('/quiz/:quiz_id/results', require_user_login, async (req, res) => 
{
    let quiz_id: number = req.params.quiz_id;
    let username: string = req.session.username;

    let quiz: Quiz = await get_quiz_by_id(quiz_id);
    let answers: QuizAnswers = await get_user_answers_for_quiz(quiz_id, username);
    if(answers === null)
    {
        res.redirect(303, '/quizzes');
        return;
    }

    let results_data = [];
    for(let i: number = 0; i < quiz.tasks.length; i++)
    {
        results_data.push({
            answer_good: (answers.answers[i] == quiz.tasks[i].answer),
            task_text: quiz.tasks[i].question,
            task_answer: answers.answers[i],
            task_correct_answer: quiz.tasks[i].answer,
            answer_time: millis_as_string(answers.question_times_ms[i]),
            penalty: quiz.tasks[i].penalty,
            avg_time: millis_as_string(await get_average_question_time(quiz.id, i))
        });
    }

    let top_quiz_results: [string, string][] = await get_top_results_for_quiz(quiz_id);

    res.render('results', {quiz_id: quiz_id, 
                          total_time: millis_as_string(answers.total_time_ms),
                          results_data: results_data,
                          leaderboard_results: top_quiz_results,
                          username: username});
});

app.use("/quiz.js", express.static('quiz.js'));
app.use("/pass_reset.js", express.static('pass_reset.js'));
app.use("/colors.css", express.static('colors.css'));

console.log("Server is running!");
app.listen(server_port);
