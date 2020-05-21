import express = require('express')
const app = express()
app.set('view engine', 'pug')
app.use(express.urlencoded({extended: true})); 
let server_port = 3000;

class Meme
{
    id: number;
    name: string;
    url: string;
    prices: [number];

    public constructor(init?:Partial<Meme>) {
        (<any>Object).assign(this, init);
    }

    public change_price(new_price: number) {
        this.prices.push(new_price);
    }

    public get_price(): number {
        return this.prices[this.prices.length - 1];
    }
}

let memes_list = 
[
    new Meme({
        id: 0,
        name: 'Gold',
        url: 'https://i.redd.it/h7rplf9jt8y21.png',
        prices: [1000]
    }),
    new Meme({
        id: 1,
        name: 'Platinum',
        url: 'http://www.quickmeme.com/img/90/90d3d6f6d527a64001b79f4e13bc61912842d4a5876d17c1f011ee519d69b469.jpg',
        prices: [1100]
    }),
    new Meme({
        id: 2,
        name: 'Elite',
        url: 'https://i.imgflip.com/30zz5g.jpg',
        prices: [1200]
    })
]

function sort_memes()
{
    memes_list.sort((meme1, meme2) => meme2.get_price() - meme1.get_price());
}

function get_meme(meme_id: number): Meme
{
    for(var meme of memes_list)
    {
        if(meme.id == meme_id)
            return meme;
    }

    return memes_list[0];
}

// Main site with memes
app.get('/', function (req, res) {
    res.render('index', { beautiful_memes: memes_list.slice(0, 1), memes: memes_list })
})

// Show single meme with details
app.get('/meme/:memeId', function (req, res) {
    let meme = get_meme(req.params.memeId);
    res.render('meme', { meme: meme })
 })

// Change meme price
app.post('/meme/:memeId', function (req, res) {
    let meme = get_meme(req.params.memeId);
    let price = req.body.price;
    meme.change_price(price);
    sort_memes();
    res.render('meme', { meme: meme })
})

sort_memes();

console.log("Server is running!");
app.listen(server_port);