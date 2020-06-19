import {Builder, Capabilities} from 'selenium-webdriver';
import { expect } from 'chai';
import { driver } from 'mocha-webdriver';


describe('testResetPassword', function () {
    it('reset password should logout from all sessions', async function() {

        this.timeout(20000);

        // Load page
        await driver.get('http://127.0.0.1:3000');

        // Login
        await (await driver.find('input[type=text]')).doSendKeys('user1');
        await (await driver.find('input[type=password]')).doSendKeys('user1');
        await (await driver.find('input[type=submit]')).doClick();

        expect(await driver.getCurrentUrl()).to.equal('http://127.0.0.1:3000/quizzes');

        // Save cookies
        let cookies = await driver.manage().getCookies();
        
        // Delete all cookies
        await driver.manage().deleteAllCookies();

        // Refresh page and check that we are logged out
        await driver.get('http://127.0.0.1:3000/quizzes');
        expect(await driver.getCurrentUrl()).to.equal('http://127.0.0.1:3000/login');

        // Login again to start another session
        await (await driver.find('input[type=text]')).doSendKeys('user1');
        await (await driver.find('input[type=password]')).doSendKeys('user1');
        await (await driver.find('input[type=submit]')).doClick();

        expect(await driver.getCurrentUrl()).to.equal('http://127.0.0.1:3000/quizzes');

        // Reset password
        await (await (await driver.find('a[href="/resetpassword"]')).doClick())
        expect(await driver.getCurrentUrl()).to.equal('http://127.0.0.1:3000/resetpassword');

        await (await driver.find('input[name=password1]')).doSendKeys('newuser1pass');
        await (await driver.find('input[name=password2]')).doSendKeys('newuser1pass');
        await (await driver.find('input[type=submit]')).doClick();        

        // We should be logged out
        expect(await driver.getCurrentUrl()).to.equal('http://127.0.0.1:3000/login');

        // Check if we are also logged out from the other session
        await driver.manage().deleteAllCookies();
        for(let cookie of cookies)
            await driver.manage().addCookie(cookie);

        await driver.get('http://127.0.0.1:3000/quizzes');
        expect(await driver.getCurrentUrl()).to.equal('http://127.0.0.1:3000/login');

        // Login with new password to make sure password reset works
        await (await driver.find('input[type=text]')).doSendKeys('user1');
        await (await driver.find('input[type=password]')).doSendKeys('newuser1pass');
        await (await driver.find('input[type=submit]')).doClick();

        expect(await driver.getCurrentUrl()).to.equal('http://127.0.0.1:3000/quizzes');
    });
})

