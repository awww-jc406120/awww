import {Builder, Capabilities} from 'selenium-webdriver';
import { expect } from 'chai';
import { driver } from 'mocha-webdriver';


describe('testSolvingQuiz', function () {
    it('tests solving quiz and receiving results', async function() {

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

        expect(await driver.getCurrentUrl()).to.equal('http://127.0.0.1:3000/quiz/0');

        // 2 + 2 * 2 = 6
        await (await driver.find('input[type=text]')).doSendKeys('6');
        await (await driver.find('#quiz-next')).doClick();

        // 8 + 8 / 2 * 4 = 24 - wrong answer here
        await (await driver.find('input[type=text]')).doSendKeys('25');
        await (await driver.find('#quiz-next')).doClick();

        // 8 - (2 - 4) / 2 = 9
        await (await driver.find('input[type=text]')).doSendKeys('9');
        await (await driver.find('#quiz-next')).doClick();

        // 7 * (3 / 7 + 3) = 24
        await (await driver.find('input[type=text]')).doSendKeys('24');
        await (await driver.find('#quiz-next')).doClick();

        // 9 / 2 - 10 / 4 = 2
        await (await driver.find('input[type=text]')).doSendKeys('2');
        await (await driver.find('#quiz-next')).doClick();

        await (await driver.find('#quiz-finish')).doClick();

        expect(await driver.getCurrentUrl()).to.equal('http://127.0.0.1:3000/quiz/0/results');

        expect(await driver.find('tr[class=good-answer] td').getText()).to.equal('2 + 2 * 2');
        expect(await driver.find('tr[class=bad-answer] td').getText()).to.equal('8 + 8 / 2 * 4');

        // Quiz solved without problems - means json sending works
    });
})

