/* Classes */
class QuizTask
{
    public question: string;
    public answer: number;
    public penalty: number;
}

class Quiz
{
    public tasks: QuizTask[];
}

function get_quiz_from_json(quiz_json: JSON): Quiz
{
    // TODO - add some actual parsing/checking here
    return <Quiz>(quiz_json as any);
}

class QuizResult
{
    public time_in_ms: number;
    public stats: number[];
}

function get_leaderboard_results(): QuizResult[]
{
    if(window.localStorage.getItem('math quiz results') === null)
        return [];

    let results_json: JSON = JSON.parse(window.localStorage.getItem('math quiz results'));

    let results: QuizResult[] = <QuizResult[]>(results_json as any);
    for(var result of results)
        if(result.stats === undefined)
            result.stats = [];

    return results;
}

function add_leaderboard_result(result: QuizResult)
{
    let results: QuizResult[] = get_leaderboard_results();
    results.push(result);

    window.localStorage.setItem('math quiz results', JSON.stringify(results));
}

/* Html elements */
let start_view = document.getElementById('start-view');
let quiz_view = document.getElementById('quiz-view');
let results_view = document.getElementById('results-view');

let start_button: HTMLElement = document.getElementById("start-button");
let start_leaderboard: HTMLElement = document.querySelector("#leaderboard table");

let quiz_question_num: HTMLElement = document.getElementById("quiz-question-num");
let quiz_question_text: HTMLElement = document.getElementById("quiz-question-text");
let quiz_question_penalty: HTMLElement = document.getElementById("quiz-question-penalty");

let quiz_answer_input: HTMLInputElement = document.querySelector("#quiz-question input[type=text]") as HTMLInputElement;

let quiz_next_button: HTMLElement = document.getElementById("quiz-next");
let quiz_prev_button: HTMLElement = document.getElementById("quiz-prev");
let quiz_cancel_button: HTMLElement = document.getElementById("quiz-cancel");
let quiz_finish_button: HTMLInputElement = document.getElementById('quiz-finish') as HTMLInputElement;

let quiz_timer: HTMLElement = document.getElementById('quiz-timer');

let result_time: HTMLElement = document.getElementById('result-time');
let results_answer_table: HTMLElement = document.querySelector('#answer-summary table');

let results_save_button: HTMLElement = document.getElementById('results-save');
let results_save_stats_button: HTMLElement = document.getElementById('results-save-stats');

/* Variables */
let current_quiz: Quiz;
let quiz_answers: Map<number, number>;
let answer_times: number[];
let current_question: number;

let quiz_start_time: Date = new Date();
let cur_question_start_time;
let quiz_time = null;

/* Code */
function choose_view(view_name: string)
{
    start_view.style.display = 'none';
    quiz_view.style.display = 'none';
    results_view.style.display = 'none';
    
    if (view_name == 'start') start_view.style.display = 'block';
    if (view_name == 'quiz') quiz_view.style.display = 'block';
    if (view_name == 'results') results_view.style.display = 'block';
}

function load_start_view()
{
    choose_view('start');
    current_quiz = null;
    quiz_answers = null;

    // Create leaderboard
    start_leaderboard.innerHTML = "";
    
    let results: QuizResult[] = get_leaderboard_results();
    results = results.sort((res1, res2) => res1.time_in_ms - res2.time_in_ms);

    
    let leaderboard_html: string = "<tr> <th> Rank </th> <th> Time </th>";
    
    let max_stats_len: number = 0;
    for(let result of results)
        max_stats_len = Math.max(max_stats_len, result.stats.length);

    for(let i: number = 0; i < max_stats_len; i++)
    leaderboard_html += "<th> Task " + (i+1) + "</th>";

    leaderboard_html += "</tr>"

    
    for(let i:number = 0; i < results.length; i++)
    {
        leaderboard_html += "<tr> <td> " + (i+1) + "</td>";

        let cur_result: QuizResult = results[i];
        leaderboard_html += "<td>" + millis_as_string(cur_result.time_in_ms) + "</td>";
        
        let s: number = 0;
        while(s < cur_result.stats.length)
        {
            leaderboard_html += "<td>" + millis_as_string(cur_result.stats[s]) + "</td>";
            s++;
        }

        while(s < max_stats_len)
        {
            leaderboard_html += "<td> - </td>";
            s++;
        }
        
        leaderboard_html += "</tr>";
    }

    start_leaderboard.innerHTML = leaderboard_html;
}

function start_quiz()
{
    choose_view('quiz');

    let quiz_string: string = 
    `{
        "tasks": [
            {"question": "2 * 2 + 2", "answer": 6, "penalty": 6},
            {"question": "8 - (2 - 4) / 2", "answer": 9, "penalty": 7},
            {"question": "7 * (3 / 7 + 3)", "answer": 24, "penalty": 8},
            {"question": "(13 - 7) * 5 - 6 * 2 + 1", "answer": 19, "penalty": 9}
        ]
     }`;
    
    let quiz: Quiz = get_quiz_from_json(JSON.parse(quiz_string));
    current_quiz = quiz;
    quiz_answers = new Map();
    quiz_start_time = new Date();
    answer_times = new Array<number>(current_quiz.tasks.length).fill(0);
    update_timer();

    quiz_finish_button.style.display = 'none';

    current_question = 0;
    cur_question_start_time = quiz_start_time;
    load_quiz_question(0);
}

function load_quiz_question(question_num: number)
{
    answer_times[current_question] += get_time_since(cur_question_start_time);
    cur_question_start_time = new Date();

    current_question = question_num;

    let cur_question = current_quiz.tasks[question_num];
    let quiz_size = current_quiz.tasks.length;

    quiz_question_num.innerHTML = (question_num + 1).toString() + "/" + quiz_size.toString();
    quiz_question_text.innerHTML = cur_question.question + " = ";
    quiz_question_penalty.innerHTML = "Bad answer: +" + cur_question.penalty.toString() + "s";

    if(quiz_answers.has(current_question))
        quiz_answer_input.value = quiz_answers.get(current_question).toString();
    else
        quiz_answer_input.value = "";
}

function load_results()
{
    answer_times[current_question] += get_time_since(cur_question_start_time);
    quiz_time = get_time_since(quiz_start_time);

    results_answer_table.innerHTML = "";

    let answers_html: string = "<th> Task </th> <th> Answer </th> <th> Time </th> <th> Correct answer </th> <th> Penalty </th> </tr>";

    for(let i: number = 0; i < current_quiz.tasks.length; i++)
    {
        let cur_row_html: string = "<td>" + (i+1) + "</td>";

        let cur_task: QuizTask = current_quiz.tasks[i];
        let answer = quiz_answers.get(i);

        cur_row_html += "<td>" + cur_task.question + " = " + answer + "</td>";
        cur_row_html += "<td>" + millis_as_string(answer_times[i]) + "</td>";

        if(answer != cur_task.answer)
        {
            cur_row_html = '<tr class="bad-answer">' + cur_row_html;

            quiz_time += cur_task.penalty * 1000;
            cur_row_html += "<td>" + cur_task.answer + "</td>";
            cur_row_html += "<td>" + cur_task.penalty + "s </td>";
        }
        else
        {
            cur_row_html = '<tr class="good-answer">' + cur_row_html;
            cur_row_html += "<td>-</td><td>-</td>";
        }

        cur_row_html += "</tr>"

        answers_html += cur_row_html;
    }

    results_answer_table.innerHTML = answers_html;

    result_time.innerHTML = "Result: " + millis_as_string(quiz_time);
    choose_view('results');
}

function save_results(save_stats: boolean)
{
    let result = new QuizResult();
    result.time_in_ms = quiz_time;

    if(save_stats)
        result.stats = answer_times;

    add_leaderboard_result(result);

    load_start_view();
}

start_button.addEventListener('click', start_quiz);

quiz_next_button.addEventListener('click', function(){
    if(current_question + 1 < current_quiz.tasks.length)
        load_quiz_question(current_question + 1);
});

quiz_prev_button.addEventListener('click', function(){
    if(current_question > 0)
        load_quiz_question(current_question - 1);
});

quiz_cancel_button.addEventListener('click', load_start_view);

quiz_finish_button.addEventListener('click', load_results);

quiz_answer_input.addEventListener('input', function(){
    if(quiz_answer_input.validity.valid)
    {
        quiz_answers.set(current_question, Number(quiz_answer_input.value));

        if(quiz_answers.size == current_quiz.tasks.length)
            quiz_finish_button.style.display = 'inline-block';
    }
});

results_save_button.addEventListener('click', function(){ save_results(false); });

results_save_stats_button.addEventListener('click', function(){ save_results(true); });

// Timer code
function get_time_since(since_date: Date): number
{
    let cur_time: Date = new Date();
    let time_in_ms: number = cur_time.getTime() - since_date.getTime();
    return time_in_ms;
}

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

function update_timer()
{
    quiz_timer.innerHTML = "Your time: " + millis_as_string(get_time_since(quiz_start_time));
}

function run_timer()
{
    update_timer();
    window.setTimeout(run_timer, 100);
}

// Load page
load_start_view();

// Run timer
run_timer();