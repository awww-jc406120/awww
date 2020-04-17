import {Builder, Capabilities} from 'selenium-webdriver';
import { expect } from 'chai';
import { driver } from 'mocha-webdriver';

let loty_path = '/home/???/awww-jc406120/lab6/loty.html';

describe('testDrugi', function () {
    it('should say something', async function() {
        this.timeout(20000);
        await driver.get('file://' + loty_path);
        expect(await driver.find('#reserve-to').getText()).to.include('Krakow');
        await driver.find('#reserve-name').sendKeys('Jan');
        await driver.find('#reserve-surname').sendKeys('Woreczko');
        await driver.find('input[value=Rezerwuj]').doClick();
    });
})

