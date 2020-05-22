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

class MemeList
{
    meme_list: Meme[];
    meme_map: Map<number, Meme>;
    public constructor(meme_list: Meme[]) {
        this.meme_list = meme_list;
        this.meme_map = new Map();

        let cur_id: number = 0;
        for(let meme of meme_list) {
            meme.id = cur_id;
            this.meme_map.set(meme.id, meme);
            cur_id++;
        }

        this.sort();
    }

    public get_meme(meme_id: number) {
        if(!this.meme_map.has(Math.floor(meme_id))) {
            throw new Error("No meme with such id!");
        }

        return this.meme_map.get(Math.floor(meme_id));
    }

    public sort() {
        this.meme_list.sort((meme1, meme2) => meme2.get_price() - meme1.get_price());
    }

    public get_list(): Meme[] {
        return this.meme_list
    }

    public get_beautiful_meme(): Meme {
        return this.get_meme(0);
    }
}

let meme_list = new MemeList(
[
    new Meme({
        name: 'Beautiful',
        url: 'https://preview.redd.it/p6wbma2a0yz41.jpg?width=960&crop=smart&auto=webp&s=d375ad7754b80dd73c63b35cad42a88c8bf9ef22',
        prices: [10]
    }),
    new Meme({
        name: 'Gold',
        url: 'https://i.redd.it/h7rplf9jt8y21.png',
        prices: [1000]
    }),
    new Meme({
        name: 'Platinum',
        url: 'http://www.quickmeme.com/img/90/90d3d6f6d527a64001b79f4e13bc61912842d4a5876d17c1f011ee519d69b469.jpg',
        prices: [1100]
    }),
    new Meme({
        name: 'Elite',
        url: 'https://i.imgflip.com/30zz5g.jpg',
        prices: [1200]
    }),
    new Meme({
        name: 'Help',
        url: 'https://i.redd.it/at0t2f1ub4051.jpg',
        prices: [1300]
    })
]);

// Main site with memes
app.get('/', function (req, res) {
    res.render('index', { beautiful_memes: [meme_list.get_beautiful_meme()], memes: meme_list.get_list() })
})

// Show single meme with details
app.get('/meme/:memeId', function (req, res) {
    try {
        let meme = meme_list.get_meme(req.params.memeId);
        res.render('meme', { meme: meme })
    }
    catch(e) {
        res.render('404', {});
        return;
    }
 })

// Change meme price
app.post('/meme/:memeId', function (req, res) {
    try {
        let meme = meme_list.get_meme(req.params.memeId);
        let price = req.body.price;
        meme.change_price(price);
        meme_list.sort();
        res.render('meme', { meme: meme })
    }
    catch(e) {
        res.render('404', {});
        return;
    }
})

console.log("Server is running!");
app.listen(server_port);