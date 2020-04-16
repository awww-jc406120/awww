let passenger_list = document.querySelectorAll(".pasazerowie > li") as NodeList;

let best_passenger = 0;

for (let i = 0; i < passenger_list.length; i++) 
{
    let cur_passenger_name = (passenger_list[i] as HTMLElement).getAttribute('data-identyfikator-pasazera');
    let best_passenger_name = (passenger_list[best_passenger] as HTMLElement).getAttribute('data-identyfikator-pasazera');
    if (cur_passenger_name > best_passenger_name)
    {
        best_passenger = i;
    }
}

console.log('Pasazer z najwiekszym leksykograficznie id to: "' + (passenger_list[best_passenger] as HTMLElement).innerHTML + '"');

