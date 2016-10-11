const webdriver = require('selenium-webdriver');

// Input capabilities
const capabilities = {
	'browserName' : 'Chrome',
	'browser_version' : '53.0',
	'os' : 'Windows',
	'os_version' : '10',
	'resolution' : '1920x1080',
	'browserstack.local': true
};

const driver = new webdriver.Builder().usingServer('http://hub-cloud.browserstack.com/wd/hub').withCapabilities(capabilities).build();

driver.get('http://localhost:1234/test/UI/UITest.html');
driver.findElement(webdriver.By.name('q')).sendKeys('BrowserStack');
driver.findElement(webdriver.By.name('btnG')).click();

driver.getTitle().then(function(title) {
	console.log(title);
});

driver.quit();