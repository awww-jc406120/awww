/* Classes */
var QuizTask = /** @class */ (function () {
    function QuizTask() {
    }
    return QuizTask;
}());
var Quiz = /** @class */ (function () {
    function Quiz() {
    }
    return Quiz;
}());
function get_quiz_from_json(quiz_json) {
    return quiz_json;
}
var QuizResult = /** @class */ (function () {
    function QuizResult() {
    }
    return QuizResult;
}());
var localstorage_results_key = "super cool math quiz results id jc406120";
function get_leaderboard_results() {
    if (window.localStorage.getItem(localstorage_results_key) === null)
        return [];
    var results_json = JSON.parse(window.localStorage.getItem(localstorage_results_key));
    var results = results_json;
    for (var _i = 0, results_1 = results; _i < results_1.length; _i++) {
        var result = results_1[_i];
        if (result.stats === undefined)
            result.stats = [];
    }
    return results;
}
function add_leaderboard_result(result) {
    var results = get_leaderboard_results();
    results.push(result);
    window.localStorage.setItem(localstorage_results_key, JSON.stringify(results));
}
/* Html elements */
var start_view = document.getElementById('start-view');
var quiz_view = document.getElementById('quiz-view');
var results_view = document.getElementById('results-view');
var start_button = document.getElementById("start-button");
var start_leaderboard = document.getElementById("leaderboard");
var start_leaderboard_table = document.querySelector("#leaderboard table");
var quiz_question_num = document.getElementById("quiz-question-num");
var quiz_question_text = document.getElementById("quiz-question-text");
var quiz_question_penalty = document.getElementById("quiz-question-penalty");
var quiz_answer_input = document.querySelector("#quiz-question input[type=text]");
var quiz_next_button = document.getElementById("quiz-next");
var quiz_prev_button = document.getElementById("quiz-prev");
var quiz_cancel_button = document.getElementById("quiz-cancel");
var quiz_finish_button = document.getElementById('quiz-finish');
var quiz_timer = document.getElementById('quiz-timer');
var result_time = document.getElementById('result-time');
var results_answer_table = document.querySelector('#answer-summary table');
var results_save_button = document.getElementById('results-save');
var results_save_stats_button = document.getElementById('results-save-stats');
/* Variables */
var current_quiz;
var quiz_answers;
var answer_times;
var current_question;
var quiz_start_time = new Date();
var cur_question_start_time;
var quiz_time = null;
/* Code */
function choose_view(view_name) {
    start_view.style.display = 'none';
    quiz_view.style.display = 'none';
    results_view.style.display = 'none';
    if (view_name == 'start')
        start_view.style.display = 'block';
    if (view_name == 'quiz')
        quiz_view.style.display = 'block';
    if (view_name == 'results')
        results_view.style.display = 'block';
}
function load_start_view() {
    choose_view('start');
    current_quiz = null;
    quiz_answers = null;
    // Create leaderboard
    var results = get_leaderboard_results();
    results = results.sort(function (res1, res2) { return res1.time_in_ms - res2.time_in_ms; });
    if (results.length == 0) {
        start_leaderboard.style.display = 'none';
        return;
    }
    var leaderboard_html = "<tr> <th> Rank </th> <th> Time </th>";
    var max_stats_len = 0;
    for (var _i = 0, results_2 = results; _i < results_2.length; _i++) {
        var result = results_2[_i];
        max_stats_len = Math.max(max_stats_len, result.stats.length);
    }
    for (var i = 0; i < max_stats_len; i++)
        leaderboard_html += "<th> Task " + (i + 1) + "</th>";
    leaderboard_html += "</tr>";
    for (var i = 0; i < results.length; i++) {
        leaderboard_html += "<tr> <td> " + (i + 1) + "</td>";
        var cur_result = results[i];
        leaderboard_html += "<td>" + millis_as_string(cur_result.time_in_ms) + "</td>";
        var s = 0;
        while (s < cur_result.stats.length) {
            leaderboard_html += "<td>" + millis_as_string(cur_result.stats[s]) + "</td>";
            s++;
        }
        while (s < max_stats_len) {
            leaderboard_html += "<td> - </td>";
            s++;
        }
        leaderboard_html += "</tr>";
    }
    start_leaderboard_table.innerHTML = leaderboard_html;
    start_leaderboard.style.display = "inline-block";
}
function start_quiz() {
    choose_view('quiz');
    var quiz_string = "{\n        \"tasks\": [\n            {\"question\": \"2 + 2 * 2\", \"answer\": 6, \"penalty\": 5},\n            {\"question\": \"8 + 8 / 2 * 4\", \"answer\": 24, \"penalty\": 6},\n            {\"question\": \"8 - (2 - 4) / 2\", \"answer\": 9, \"penalty\": 7},\n            {\"question\": \"7 * (3 / 7 + 3)\", \"answer\": 24, \"penalty\": 8},\n            {\"question\": \"9 / 2 - 10 / 4\", \"answer\": 2, \"penalty\": 9}\n        ]\n     }";
    var quiz = get_quiz_from_json(JSON.parse(quiz_string));
    current_quiz = quiz;
    quiz_answers = new Map();
    quiz_start_time = new Date();
    answer_times = new Array(current_quiz.tasks.length).fill(0);
    update_timer();
    quiz_finish_button.style.display = 'none';
    current_question = 0;
    cur_question_start_time = quiz_start_time;
    load_quiz_question(0);
}
function load_quiz_question(question_num) {
    var load_time = new Date();
    answer_times[current_question] += get_time_between(cur_question_start_time, load_time);
    cur_question_start_time = load_time;
    current_question = question_num;
    var cur_question = current_quiz.tasks[question_num];
    var quiz_size = current_quiz.tasks.length;
    quiz_question_num.innerHTML = (question_num + 1).toString() + "/" + quiz_size.toString();
    quiz_question_text.innerHTML = cur_question.question + " = ";
    quiz_question_penalty.innerHTML = "Bad answer: +" + cur_question.penalty.toString() + "s";
    if (quiz_answers.has(current_question))
        quiz_answer_input.value = quiz_answers.get(current_question).toString();
    else
        quiz_answer_input.value = "";
}
function load_results() {
    var end_time = new Date();
    answer_times[current_question] += get_time_between(cur_question_start_time, end_time);
    quiz_time = get_time_between(quiz_start_time, end_time);
    var answers_html = "<th> Task </th> <th> Answer </th> <th> Time </th> <th> Correct </th> <th> Penalty </th> </tr>";
    for (var i = 0; i < current_quiz.tasks.length; i++) {
        var cur_row_html = "<td>" + (i + 1) + "</td>";
        var cur_task = current_quiz.tasks[i];
        var answer = quiz_answers.get(i);
        cur_row_html += "<td>" + cur_task.question + " = " + answer + "</td>";
        cur_row_html += "<td>" + millis_as_string(answer_times[i]) + "</td>";
        if (answer != cur_task.answer) {
            cur_row_html = '<tr class="bad-answer">' + cur_row_html;
            quiz_time += cur_task.penalty * 1000;
            cur_row_html += "<td>" + cur_task.answer + "</td>";
            cur_row_html += "<td>+" + cur_task.penalty + "s </td>";
        }
        else {
            cur_row_html = '<tr class="good-answer">' + cur_row_html;
            cur_row_html += "<td>-</td><td>-</td>";
        }
        cur_row_html += "</tr>";
        answers_html += cur_row_html;
    }
    results_answer_table.innerHTML = answers_html;
    result_time.innerHTML = millis_as_string(quiz_time);
    choose_view('results');
}
function save_results(save_stats) {
    var result = new QuizResult();
    result.time_in_ms = quiz_time;
    if (save_stats)
        result.stats = answer_times;
    add_leaderboard_result(result);
    load_start_view();
}
start_button.addEventListener('click', start_quiz);
quiz_next_button.addEventListener('click', function () {
    if (current_question + 1 < current_quiz.tasks.length)
        load_quiz_question(current_question + 1);
});
quiz_prev_button.addEventListener('click', function () {
    if (current_question > 0)
        load_quiz_question(current_question - 1);
});
quiz_cancel_button.addEventListener('click', load_start_view);
quiz_finish_button.addEventListener('click', load_results);
quiz_answer_input.addEventListener('input', function () {
    if (quiz_answer_input.validity.valid) {
        quiz_answers.set(current_question, Number(quiz_answer_input.value));
        if (quiz_answers.size == current_quiz.tasks.length)
            quiz_finish_button.style.display = 'inline-block';
    }
});
results_save_button.addEventListener('click', function () { save_results(false); });
results_save_stats_button.addEventListener('click', function () { save_results(true); });
// Timer code
function get_time_between(from_date, to_date) {
    var time_in_ms = to_date.getTime() - from_date.getTime();
    return time_in_ms;
}
function millis_as_string(time_in_ms) {
    var seconds = Math.floor(time_in_ms / 1000) % 60;
    var minutes = Math.floor(time_in_ms / 1000 / 60) % 60;
    var hours = Math.floor(time_in_ms / 1000 / 60 / 60);
    var result = seconds + "." + Math.floor((time_in_ms % 1000) / 100) + "s";
    if (minutes > 0)
        result = minutes + "m " + result;
    if (hours > 0)
        result = hours + "h " + result;
    return result;
}
function update_timer() {
    quiz_timer.textContent = "Your time: " + millis_as_string(get_time_between(quiz_start_time, new Date()));
}
function run_timer() {
    update_timer();
    window.setTimeout(run_timer, 100);
}
// Load page
load_start_view();
// Run timer
run_timer();
