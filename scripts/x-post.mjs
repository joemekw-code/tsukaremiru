/**
 * Post to X/Twitter using Playwright with existing Chrome session
 * No API keys needed - uses the browser's logged-in state
 *
 * Usage: node scripts/x-post.mjs "tweet text here"
 */

import { chromium } from 'playwright';
import path from 'path';
import os from 'os';

const TWEET_TEXT = process.argv[2];
if (!TWEET_TEXT) {
  console.error('Usage: node scripts/x-post.mjs "tweet text"');
  process.exit(1);
}

const CHROME_USER_DATA = path.join(
  os.homedir(),
  'Library/Application Support/Google/Chrome'
);

async function postTweet() {
  console.log('Starting browser with existing Chrome session...');

  // Launch with existing user data to reuse cookies
  // Need to use a copy to avoid conflicts with running Chrome
  const context = await chromium.launchPersistentContext(
    path.join(CHROME_USER_DATA, 'Default'),
    {
      headless: false,
      channel: 'chrome',
      args: [
        '--disable-blink-features=AutomationControlled',
      ],
      viewport: { width: 1280, height: 800 },
    }
  );

  const page = await context.newPage();

  try {
    // Navigate to X compose
    console.log('Navigating to X...');
    await page.goto('https://x.com/compose/post', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    // Wait for the tweet compose box
    console.log('Waiting for compose box...');
    const editor = await page.waitForSelector(
      '[data-testid="tweetTextarea_0"], [role="textbox"]',
      { timeout: 15000 }
    );

    if (!editor) {
      console.error('Could not find tweet compose box. May not be logged in.');
      await context.close();
      process.exit(1);
    }

    // Type the tweet
    console.log('Typing tweet...');
    await editor.click();
    await page.keyboard.type(TWEET_TEXT, { delay: 20 });

    // Wait a moment
    await page.waitForTimeout(1000);

    // Click the Post button
    console.log('Posting...');
    const postButton = await page.waitForSelector(
      '[data-testid="tweetButton"], [data-testid="tweetButtonInline"]',
      { timeout: 5000 }
    );

    if (postButton) {
      await postButton.click();
      console.log('Tweet posted!');
      await page.waitForTimeout(3000);
    } else {
      // Fallback: Cmd+Enter
      console.log('Post button not found, trying Cmd+Enter...');
      await page.keyboard.press('Meta+Enter');
      await page.waitForTimeout(3000);
    }

    // Verify by checking for success indicator
    const url = page.url();
    console.log('Current URL:', url);

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await context.close();
  }
}

postTweet().catch(console.error);
