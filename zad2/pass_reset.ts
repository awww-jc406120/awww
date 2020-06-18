let change_button: HTMLInputElement = document.querySelector("input[type=submit]");

let password_input1: HTMLInputElement = document.querySelector("input[name=password1]");
let password_input2: HTMLInputElement = document.querySelector("input[name=password2]");

let no_match_message: HTMLElement = document.querySelector("p[class=password-no-match]");

function on_input_changed() 
{
    change_button.disabled = false;

    if(password_input1.value === "" || password_input1.value === "")
        change_button.disabled = true;

    if(password_input1.value != password_input2.value)
    {
        no_match_message.style.display = 'block';
        change_button.disabled = true;
    }
    else
        no_match_message.style.display = 'none';

}

password_input1.addEventListener('input', on_input_changed);
password_input2.addEventListener('input', on_input_changed);

change_button.disabled = true;