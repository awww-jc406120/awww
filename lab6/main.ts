import {fib} from './fib'

let submit_button = document.querySelector('input[value=Rezerwuj]') as HTMLInputElement;
//submit_button.disabled = true;
let clear_button = document.querySelector('input[value=Wyczysc]') as HTMLInputElement;

let p_to_change = document.getElementById("pierwszy") as HTMLParagraphElement;
p_to_change.innerHTML = "Tu jest pierwzy akapit ale zmodyfikowany";

let body = document.querySelector('body');
let div = document.createElement('div');
body.appendChild(div);

setTimeout(() => {
  console.log('No już wreszcie.');
}, 2000);

function wait(ms) {
    return new Promise((resolve, reject) => {
        window.setTimeout(resolve, ms);
    });
}

function teczoweKolory(el: HTMLElement) {
    wait(1000)
    .then(() => el.style.backgroundColor = 'red')
    .then(() => wait(1000))
    .then(() => el.style.backgroundColor = 'orange')
    .then(() => wait(1000))
    .then(() => el.style.backgroundColor = 'yellow')
    .then(() => wait(1000))
    .then(() => el.style.backgroundColor = 'green')
    .then(() => wait(1000))
    .then(() => el.style.backgroundColor = 'blue')
    .then(() => wait(1000))
    .then(() => el.style.backgroundColor = 'indigo')
    .then(() => wait(1000))
    .then(() => el.style.backgroundColor = 'purple');
}

let loty = document.querySelector('table') as HTMLElement;

teczoweKolory(loty);

fetch('https://api.github.com/repos/Microsoft/TypeScript/commits')
    .then((request) => request.json())
    .then((data) => 
    {
      let avatar_url = data[0].author.avatar_url;

      let new_img = document.createElement('img');
      new_img.src = avatar_url;
      body.appendChild(new_img);
    });

let opoznienia = document.querySelector('aside') as HTMLElement;
let rezerwacja = document.querySelector('form') as HTMLElement;

let grid = document.querySelector('.main') as HTMLElement;
let i = 0;

function handleClick() {
    let new_color = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'purple'][Math.floor(Math.random() * 6)];

    opoznienia.style.backgroundColor = new_color;
    rezerwacja.style.backgroundColor = new_color;

    console.log("fib(10*i): " + fib(10*i));
    i++;
}

opoznienia.addEventListener("click", handleClick);

let from_input = document.querySelector('#reserve-from') as HTMLInputElement;
let to_input = document.querySelector('#reserve-to') as HTMLInputElement;
let when_input = document.querySelector('#reserve-when') as HTMLInputElement;
let name_input = document.querySelector('#reserve-name') as HTMLInputElement;
let surname_input = document.querySelector('#reserve-surname') as HTMLInputElement;

function handleFormInput() {
    submit_button.disabled = name_input.value.length == 0 || surname_input.value.length == 0;
}

name_input.addEventListener("input", handleFormInput);
surname_input.addEventListener("input", handleFormInput);

submit_button.addEventListener("click", function(){
    alert("Zarezerwowano z "+from_input.value+" do "+to_input.value+". termin: "+when_input.value + " podrozny: " + name_input.value + " " + surname_input.value);
});

clear_button.addEventListener("click", function(){
    name_input.value = "";
    surname_input.value = "";
    handleFormInput();
});
