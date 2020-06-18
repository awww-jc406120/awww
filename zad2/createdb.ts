import sqlite3 = require('sqlite3');
sqlite3.verbose();
import bcrypt = require('bcrypt');

let db = new sqlite3.Database('quiz_server.db');

let saltRounds = 2;

function add_user(db: sqlite3.Database, username: string, password: string)
{
    bcrypt.genSalt(saltRounds, (err, salt) => {
        bcrypt.hash(password, salt, (err, pass_hash) => 
        {
            db.run('INSERT INTO users VALUES (?, ?, 0)', username, pass_hash);
        });
    });
}

db.serialize(() => 
{
    db.run("CREATE TABLE users (username TEXT PRIMARY KEY, pass_hash TEXT, pass_version INTEGER)");
    db.run("CREATE TABLE user_pass_version (username TEXT PRIMARY KEY, version INTEGER)");

    db.run("CREATE TABLE quizzes (quiz_id INTEGER PRIMARY KEY, quiz_json TEXT)");

    db.run("CREATE TABLE quiz_start_times (username TEXT, quiz_id INTEGER, start_time INTEGER)");
    db.run("CREATE TABLE quiz_times (username TEXT, quiz_id INTEGER, time_ms INTEGER)");
    db.run("CREATE TABLE quiz_answers (username TEXT, quiz_id INTEGER, question_id INTEGER, answer INTEGER, time_ms INTEGER)");

    // Add users
    add_user(db, 'user1', 'user1');
    add_user(db, 'user2', 'user2');

    // Add quizzes
    db.run("INSERT INTO quizzes VALUES (0, ?)",
    `{
        "id": 0,
        "tasks": [
            {"question": "2 + 2 * 2", "answer": 6, "penalty": 5},
            {"question": "8 + 8 / 2 * 4", "answer": 24, "penalty": 6},
            {"question": "8 - (2 - 4) / 2", "answer": 9, "penalty": 7},
            {"question": "7 * (3 / 7 + 3)", "answer": 24, "penalty": 8},
            {"question": "9 / 2 - 10 / 4", "answer": 2, "penalty": 9}
        ]
     }`);

     db.run("INSERT INTO quizzes VALUES (1, ?)",
    `{
        "id": 1,
        "tasks": [
            {"question": "2 + 2 * 2", "answer": 6, "penalty": 5},
            {"question": "8 + 8 / 2 * 4", "answer": 24, "penalty": 6},
            {"question": "8 - (2 - 4) / 2", "answer": 9, "penalty": 7},
            {"question": "7 * (3 / 7 + 3)", "answer": 24, "penalty": 8},
            {"question": "9 / 2 - 10 / 4", "answer": 2, "penalty": 9}
        ]
     }`);
});