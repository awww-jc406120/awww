import express = require('express');
import session = require('express-session');
import SQLiteStoreCreator = require('connect-sqlite3');
let SQLiteStore = SQLiteStoreCreator(session);
import csurf = require('csurf');
import sqlite3 = require('sqlite3');
sqlite3.verbose();

const app = express()
app.set('view engine', 'pug')
app.use(express.urlencoded({extended: true})); 
app.use(session({resave: false, 
                 saveUninitialized: true,
                 store: new SQLiteStore,
                 secret: "9uQaiS5nRFS5R3Y3zM09y371e6sBuWEYcOIAy0Aa8cIfrBPJ2QxR7Wjw9060LKkenlWRMxZc17Sn8OIQoxXz7JMEKio3DDr516E0Jzs17p9tl9EpBbXvF874Jk7BsA7Fl9Yjt2i7XEB5sRp31FIdrPSUcygOGxIUOBf9f5yaDxqsRfYCgtv4YmeTru1YlXcK6h5zKjYGGjewFLp1SlK5BkTrGJ9zTB3pxHuw05i1Whw8wqWTBNMAjLhE0qBHvEE0z1I7Ip8uAULO6MQnuEazPHZqKRTLPePIBi0HIvtlJKJTEPd2mK5cXiDXDxVCyxiFnvNAcKPeDEwoVQqZWVJI0Sc5eCBRN4EQyIjsNetx0NNieXKX5Uytw3EZrIlfeMquwxFHdXWl0Tlmf5BAXEq0M50804uKhFDgIEWkUbG6yQbBvAePae5gr76oM3JnkpzXSll9hGSXBlfRT2XV6N6KtsDlsTZ28JEcnvy5405S3DnYylx5gLcs1YsTNvg0KXCKJ2uNvJhROpPH5LtiY7jhAMASP63gMPIYiWg3WC34BCPb9hpK6ZP4yY7oHLuHCrkcv9pvAf7xrnmL0P1QlYDFl5yU4nnV76LYDs7xOE5Qv7gnLtyXl1oEHUl4ehd6MYf4JXjTGOchg8ifYu0EA9u4LRCllKemT9Lgm9cHuhRtufvgBgCJnuyq0xqC3QScMWxbV1KyAVB7ZXgCfoEgI5iUthzRUWXjfWSl31Z9aDqeVZ9IFoKW6J4efSlXNbV8hCJZ3uGktmpXMcjQIARt9Ztz2IjkdCXbPw256ghrZ2QoAAyXI5mBKqmeFzZTopbPgOBYElJMTsDKsQjZmGFiY7tJS3Zol6KrL1bY4sYK7K0dBrKwVSdJsgcmf96ekHtmqmOWn3VSKucWhkBEjaUdJJJyV7FVunzTbwMkOD1fjutJIBl6TAVDR3wgo6XFTMipCeiIhPBzq8swVDnXynck8qwRHCmj0JjpPjaYAOM3ojI1",
                 cookie: { maxAge: 15 * 60 * 1000} // 15 minutes
                }));
app.use(csurf({cookie: false}));

let server_port = 3000;


class Meme
{
    id: number;
    name: string;
    url: string;
    cur_price: number;

    public constructor(init?:Partial<Meme>) {
        (<any>Object).assign(this, init);
    }
}

let meme_db = new sqlite3.Database('memes.db');

function init_db(meme_list: Meme[])
{
    meme_db.serialize(function() {
        meme_db.run("CREATE TABLE memes (id INTEGER PRIMARY KEY, name TEXT, url TEXT)");
        meme_db.run("CREATE TABLE meme_prices (meme_id INTEGER, price INTEGER, setter_username varchar, set_date Datetime)");
        
        for(let meme of meme_list) 
        {
            meme_db.run("INSERT INTO memes VALUES (?, ?, ?)", meme.id, meme.name, meme.url);
            meme_db.run("INSERT INTO meme_prices VALUES (?, ?, 'op', datetime('now'))", meme.id, meme.cur_price);
        }
    });
}

function get_meme_by_id(meme_id: number, callback: ((_: Meme) => void) )
{
    meme_db.get("SELECT name, \
                        url,  \
                        (SELECT price FROM meme_prices WHERE meme_id = ? GROUP BY meme_id HAVING max(set_date)) price \
                        FROM memes WHERE id = ?", meme_id, meme_id, (err, row) => 
    {
        if(row != undefined)
        {
            let result = new Meme({
                id: meme_id,
                name: row.name,
                url: row.url,
                cur_price: row.price
            });
            
            callback(result);
        }
        else
        {
            callback(null);
        }
    });
}

function get_meme_price_history(meme_id: number, callback: ((_: [number, String][]) => void))
{
    let result: [number, String][] = null;

    meme_db.all("SELECT price, setter_username FROM meme_prices WHERE meme_id = ? ORDER BY set_date DESC", meme_id, (err, rows) => {
        
        let result: [number, String][] = []

        for(let row of rows) {
            result.push([row.price, row.setter_username]);
        }
        
        callback(result);
    });
}

function get_all_memes(callback: ((_: Meme[]) => void))
{
    meme_db.all("SELECT id, name, url, price FROM memes JOIN meme_prices ON id = meme_id GROUP BY id HAVING max(set_date)", (err, rows) => 
    {
        let result: Meme[] = [];

        for(let row of rows)
        {
            result.push(new Meme({
                id: row.id,
                name: row.name,
                url: row.url,
                cur_price: row.price
            }));
        }

        callback(result);
    })
}

function set_new_meme_price(meme_id: number, new_price: number, setter_username: String)
{
    meme_db.run("INSERT INTO meme_prices VALUES (?, ?, ?, datetime('now'))",
                meme_id, new_price, setter_username);
}

// Initalize db if not initalized
get_meme_by_id(0, (meme: Meme) => {
    if(meme) // DB exists - do nothing
        return;

    init_db([
        new Meme({
            id: 0,
            name: 'Beautiful',
            url: 'https://preview.redd.it/p6wbma2a0yz41.jpg?width=960&crop=smart&auto=webp&s=d375ad7754b80dd73c63b35cad42a88c8bf9ef22',
            cur_price: 10
        }),
        new Meme({
            id: 1,
            name: 'Gold',
            url: 'https://i.redd.it/h7rplf9jt8y21.png',
            cur_price: 1000
        }),
        new Meme({
            id: 2,
            name: 'Platinum',
            url: 'http://www.quickmeme.com/img/90/90d3d6f6d527a64001b79f4e13bc61912842d4a5876d17c1f011ee519d69b469.jpg',
            cur_price: 1100
        }),
        new Meme({
            id: 3,
            name: 'Elite',
            url: 'https://i.imgflip.com/30zz5g.jpg',
            cur_price: 1200
        }),
        new Meme({
            id: 4,
            name: 'Help',
            url: 'https://i.redd.it/at0t2f1ub4051.jpg',
            cur_price: 1300
        })
    ]);  
})

function increase_views(session)
{
    if(session.views)
        session.views += 1;
    else
        session.views = 1;
}

// Main site with memes
app.get('/', function (req, res) {
    increase_views(req.session);

    get_all_memes((memes: Meme[]) => 
    {
        let beautiful_meme: Meme = memes[0];
        for(let meme of memes)
        {
            if(meme.id == 0)
                beautiful_meme = meme;
        }

        res.render('index', { beautiful_memes: [beautiful_meme], memes: memes, 
                              username: req.session.username, views: req.session.views,
                              csrfToken: req.csrfToken()})
    })
})

// Show single meme with details
app.get('/meme/:memeId', function (req, res) 
{
    increase_views(req.session);

    get_meme_by_id(req.params.memeId, (meme: Meme) => {
        if(meme === null)
            res.render('404', {});
        else
        {
            get_meme_price_history(meme.id, (meme_prices: [number, String][]) => {
                res.render('meme', { meme: meme, meme_prices: meme_prices, 
                                     csrfToken: req.csrfToken(), 
                                     views: req.session.views, 
                                     username: req.session.username})
            })
        }
    });
 })

// Change meme price
app.post('/meme/:memeId', function (req, res) {

    if(req.session.username)
    {
        set_new_meme_price(req.params.memeId, req.body.price, req.session.username);
        res.redirect(303, '/meme/' + req.params.memeId);
    }
    else
        res.redirect(303, '/login', {});
})


// Users
class User
{
    username: string;
    password: string;

    public constructor(name: string, pass: string)
    {
        this.username = name;
        this.password = pass;
    }
};


let users: User[] = [
    new User("admin", "admin"),
    new User("user1", "pass1")
];

function verify_user(username: string, password: string): boolean 
{
    for(let user of users)
        if(user.username === username && user.password == password)
            return true;

    return false;
}

app.get('/login', function (req, res) 
{
    increase_views(req.session);
    res.render('login', {csrfToken: req.csrfToken(), views: req.session.views});
});

app.post('/login', function (req, res) {
    if(verify_user(req.body.username, req.body.password))
    {
        req.session.username = req.body.username;
        res.redirect(303, '/');
    }
    else
        res.redirect(303, '/login');
});

app.get('/logout', function (req, res) {
    req.session.username = null;
    res.redirect(303, '/');
});

console.log("Server is running!");
app.listen(server_port);