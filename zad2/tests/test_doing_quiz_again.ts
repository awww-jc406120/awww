import {Builder, Capabilities} from 'selenium-webdriver';
import { expect } from 'chai';
import { driver } from 'mocha-webdriver';


describe('testQuizAgain', function () {
    it('quiz can be solved only once', async function() {

        this.timeout(20000);

        // Load page
        await driver.get('http://127.0.0.1:3000');

        // Login
        await (await driver.find('input[type=text]')).doSendKeys('user1');
        await (await driver.find('input[type=password]')).doSendKeys('user1');
        await (await driver.find('input[type=submit]')).doClick();

        expect(await driver.getCurrentUrl()).to.equal('http://127.0.0.1:3000/quizzes');

        // Start quiz #0
        await (await driver.find('a[href="/quiz/0"]')).doClick();

        // We should be redirected to results because it is already solved
        expect(await driver.getCurrentUrl()).to.equal('http://127.0.0.1:3000/quiz/0/results');
    });
})

