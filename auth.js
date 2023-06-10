require('dotenv').config();

const playwright = require('playwright-extra');
const stealthPlugin = require('puppeteer-extra-plugin-stealth');
const axios = require('axios');

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


let browser, page, client, context;
let ready = false;

async function sendMessage(message) {
  await page.evaluate(async (message) => {
    const messageInput = document.querySelector('div[id="message-input"]');
    messageInput.focus();
    messageInput.textContent = message;


    const enterKeyEvent = new KeyboardEvent('keydown', { key: 'Enter' });

    messageInput.dispatchEvent(enterKeyEvent);

    await new Promise(resolve => setTimeout(resolve, 200));

    const agreeButton = document.querySelector('button[class="variant-action size-sm !w-full"]');
    if (agreeButton) {
      console.log(agreeButton)
      agreeButton.click();
      messageInput.dispatchEvent(enterKeyEvent);
    }

    ready = true;
  }, message);
}

async function initBrowser() {
  console.log('Launching browser')

  playwright.chromium.use(stealthPlugin());

  browser = await playwright.chromium.launch({ headless: false, devtools: false });

  console.log('Browser opened')

  context = await browser.newContext();
  page = await context.newPage();

  client = await page.context().newCDPSession(page);
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
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Click on the submit button
  await page.click('button[type="submit"]');

  // Wait for the network request to complete
  await page.waitForURL(baseFetchUrl);

  // Go to basefetchURl/bycop
  await page.goto(`${baseFetchUrl}/bycop/chatroom`);

  // Wait for the network request to complete
  await page.waitForURL(`${baseFetchUrl}/bycop/chatroom`);

  // Wait for the network request to complete
  await page.waitForSelector('div[id="message-input"]');

  sendMessage("Bot is Ready!");
}

async function isReady() {
  return ready;
}

module.exports = {
  initBrowser,
  sendMessage,
  isReady
}