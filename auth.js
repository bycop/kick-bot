require('dotenv').config();
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch(
    {
      headless: false,
      defaultViewport: null,
      args: ['--enable-javascript', '--enable-cookies']
    });
  const page = await browser.newPage();

  // Navigate to the website
  await page.goto('https://kick.com');

  // Click on the login button
  await page.click('#login-button');

  await page.waitForSelector('input[placeholder="you@example.com"]');

  // Fill in the username and password fields
  await page.type('input[placeholder="you@example.com"]', process.env.USERNAME);
  await page.type('input[type="password"]', process.env.PASSWORD);

  // js Timeout 5s
  // await new Promise(resolve => setTimeout(resolve, 5000));

  // Click on the submit button
  await page.click('button[type="submit"]');

  // Wait for the network request to complete
  await page.waitForNavigation();

  // Get the value of the XSRF-TOKEN cookie
  const cookies = await page.cookies();
  const xsrfTokenCookie = cookies.find(cookie => cookie.name === 'XSRF-TOKEN');
  const xsrfTokenValue = xsrfTokenCookie ? xsrfTokenCookie.value : null;

  // Print the XSRF-TOKEN cookie value
  console.log('XSRF-TOKEN:', xsrfTokenValue);

  await browser.close();
})();
