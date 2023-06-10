require('dotenv').config();
const playwright = require('playwright-extra');
const stealthPlugin = require('puppeteer-extra-plugin-stealth');

const baseFetchUrl = 'https://kick.com';

const blockedResources = [
	// Assets
	'*/favicon.ico',
	// '.css',
	'.jpg',
	'.jpeg',
	'.png',
	'.svg',
	'.woff',
	'.woff2',
	'.webp',

	// Analytics and other fluff
	'q.stripe.com'
];


console.log("test2");


(async () => {
	console.log('Launching browser')

	playwright.chromium.use(stealthPlugin());

	const browser = await playwright.chromium.launch({ headless: false, devtools: false });

	console.log('Browser opened')

	const context = await browser.newContext();
	const page = await context.newPage();

	const client = await page.context().newCDPSession(page);
	await client.send('Network.setBlockedURLs', { urls: blockedResources })
	await client.send('Network.enable')
	await page.goto(`${baseFetchUrl}/community-guidelines`)

	// Click on the login button
	await page.click('#login-button');

	// Wait for the login form to appear
	await page.waitForSelector('input[placeholder="you@example.com"]');

	// Fill in the username and password fields
	await page.type('input[placeholder="you@example.com"]', process.env.KICK_USERNAME);
	await page.type('input[type="password"]', process.env.KICK_PASSWORD);

	// js Timeout 5s
	await new Promise(resolve => setTimeout(resolve, 2000));

	// Click on the submit button
	await page.click('button[type="submit"]');

	// Wait for the network request to complete
	await page.waitForURL(baseFetchUrl);

	// Get cookies
	const cookies = await context.cookies();
	
	// Print the XSRF-TOKEN cookie value
	const xsrfTokenCookie = cookies.find(cookie => cookie.name === 'XSRF-TOKEN');
	const xsrfTokenValue = xsrfTokenCookie ? xsrfTokenCookie.value : null;
	console.log('XSRF-TOKEN:', xsrfTokenValue);
})();
