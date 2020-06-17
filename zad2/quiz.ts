// Classess
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
}

function get_quiz_from_json(quiz_json: JSON): Quiz
{
    return <Quiz>(quiz_json as any);
}

class QuizAnswers
{
    answers: number[];
    question_time_percentages: number[]
    total_time_ms: number;
}

function get_quiz_answers_from_json(answers_json: JSON) : QuizAnswers
{
    return <QuizAnswers>(answers_json as any);
}

// Html elements
let quiz_id_div: HTMLElement = document.getElementById("quiz-id");

let quiz_question_num: HTMLElement = document.getElementById("quiz-question-num");
let quiz_question_text: HTMLElement = document.getElementById("quiz-question-text");
let quiz_question_penalty: HTMLElement = document.getElementById("quiz-question-penalty");

let quiz_answer_input: HTMLInputElement = document.querySelector("#quiz-question input[type=text]") as HTMLInputElement;

let quiz_next_button: HTMLElement = document.getElementById("quiz-next");
let quiz_prev_button: HTMLElement = document.getElementById("quiz-prev");
let quiz_cancel_button: HTMLElement = document.getElementById("quiz-cancel");
let quiz_finish_button: HTMLInputElement = document.getElementById('quiz-finish') as HTMLInputElement;

let quiz_timer: HTMLElement = document.getElementById('quiz-timer');

// Variables
let current_quiz: Quiz;
let quiz_answers: Map<number, number> = new Map();
let answer_times: number[] = [];
let current_question: number;

let quiz_start_time: Date = new Date();
let cur_question_start_time: Date;
let quiz_time: number = null;

function start_quiz()
{
    quiz_answers = new Map();
    quiz_start_time = new Date();
    answer_times = new Array<number>(current_quiz.tasks.length).fill(0);
    run_timer();

    quiz_finish_button.style.display = 'none';

    current_question = 0;
    cur_question_start_time = quiz_start_time;
    load_quiz_question(0);
}

function load_quiz_question(question_num: number)
{
    let load_time: Date = new Date();
    answer_times[current_question] += get_time_between(cur_question_start_time, load_time);
    cur_question_start_time = load_time;

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

function submit_results()
{
    let my_answers = new QuizAnswers();
    my_answers.answers = new Array<number>(current_quiz.tasks.length).fill(0);
    my_answers.question_time_percentages = my_answers.answers = new Array<number>(current_quiz.tasks.length).fill(0);

    my_answers.question_time_percentages[0] = 1;

    for(let i: number = 0; i < current_quiz.tasks.length; i++)
    {
        my_answers.answers[i] = quiz_answers.get(i);
    }

    console.log("Submitting results!\n");

    fetch('/quiz/' + current_quiz.id + "/answers");
}

quiz_next_button.addEventListener('click', function(){
    if(current_question + 1 < current_quiz.tasks.length)
        load_quiz_question(current_question + 1);
});

quiz_prev_button.addEventListener('click', function(){
    if(current_question > 0)
        load_quiz_question(current_question - 1);
});

quiz_cancel_button.addEventListener('click', () => {console.log("Yeah canceling xD")});

quiz_finish_button.addEventListener('click', submit_results);

quiz_answer_input.addEventListener('input', function() {
    if(quiz_answer_input.validity.valid)
    {
        quiz_answers.set(current_question, Number(quiz_answer_input.value));

        if(quiz_answers.size == current_quiz.tasks.length)
            quiz_finish_button.style.display = 'inline-block';
    }
});

// Timer code
function get_time_between(from_date: Date, to_date: Date): number
{
    let time_in_ms: number = to_date.getTime() - from_date.getTime();
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
    quiz_timer.textContent = "Your time: " + millis_as_string(get_time_between(quiz_start_time, new Date()));
}

function run_timer()
{
    update_timer();
    window.setTimeout(run_timer, 100);
}

// TODO - fetch from server
let quiz_id: number = Number(quiz_id_div.innerHTML);
console.log("quiz_id: " + quiz_id);

let received_data;

fetch('/quiz/' + quiz_id + '/data')
.then(response => response.json())
.then(data =>
{
    received_data = data;
    current_quiz = get_quiz_from_json(data);
    start_quiz();
});
