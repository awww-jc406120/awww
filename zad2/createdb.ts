import sqlite3 = require('sqlite3');
sqlite3.verbose();

let db = new sqlite3.Database('quiz_server.db');

db.serialize(() => 
{
    db.run("CREATE TABLE users (username TEXT PRIMARY KEY, password TEXT)");
    db.run("CREATE TABLE quizzes (quiz_id INTEGER PRIMARY KEY, quiz_json TEXT)");
    db.run("CREATE TABLE quiz_start_times (username TEXT, quiz_id INTEGER PRIMARY KEY, start_time INTEGER)");
    db.run("CREATE TABLE quiz_answers (username TEXT, quiz_answers_json TEXT)");

    // Add users
    db.run("INSERT INTO users VALUES ('user1', 'user1')");
    db.run("INSERT INTO users VALUES ('user2', 'user2')");

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
});