/**
 * X Engagement Automation via AppleScript + Arc
 * Searches relevant keywords, likes tweets, follows users
 * Run: node scripts/x-engage.mjs
 */
import { execSync } from 'child_process';

const KEYWORDS = [
  '疲れた 仕事',
  '睡眠不足 エンジニア',
  '徹夜 プログラマー',
  'tired developer',
  '目の下 クマ 仕事',
  '寝不足 やばい',
  'Oura Ring 疲労',
  '疲労 可視化',
  'burnout エンジニア',
  '睡眠 トラッキング',
];

function arc(js) {
  try {
    const result = execSync(`osascript -e '
      tell application "Arc"
        tell front window
          repeat with t in tabs
            if URL of t contains "x.com" then
              tell t to execute javascript "${js.replace(/'/g, "\\'").replace(/"/g, '\\"')}"
              return result
            end if
          end repeat
        end tell
      end tell
    '`, { timeout: 10000 }).toString().trim();
    return result;
  } catch (e) {
    return 'error: ' + e.message.substring(0, 100);
  }
}

function arcNav(url) {
  try {
    execSync(`osascript -e '
      tell application "Arc"
        tell front window
          repeat with t in tabs
            if URL of t contains "x.com" then
              tell t to set URL to "${url}"
              return "done"
            end if
          end repeat
        end tell
      end tell
    '`, { timeout: 10000 });
  } catch (e) {}
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function engageWithKeyword(keyword) {
  const encoded = encodeURIComponent(keyword);
  console.log(`Searching: ${keyword}`);
  arcNav(`https://x.com/search?q=${encoded}&src=typed_query&f=live`);
  await sleep(3000);

  // Like tweets
  const liked = arc(`
    var likes = document.querySelectorAll('[data-testid=\\"like\\"]');
    var c = 0;
    likes.forEach(function(btn, i) {
      if (i < 5) { setTimeout(function(){ btn.click(); }, i * 400); c++; }
    });
    'liked ' + c;
  `);
  console.log(`  ${liked}`);
  await sleep(3000);
}

async function tryPost(text) {
  console.log('Attempting to post...');
  arcNav('https://x.com/compose/post');
  await sleep(2000);

  const hasEditor = arc(`!!document.querySelector('[data-testid=\\"tweetTextarea_0\\"]') ? 'yes' : 'no'`);
  if (hasEditor !== '"yes"') {
    console.log('  No editor found');
    return false;
  }

  arc(`
    var e = document.querySelector('[data-testid=\\"tweetTextarea_0\\"]');
    e.focus();
    document.execCommand('insertText', false, '${text.replace(/'/g, "\\'")}');
    'inserted';
  `);
  await sleep(1000);

  const result = arc(`
    var btns = Array.from(document.querySelectorAll('button'));
    var p = btns.find(b => b.textContent.trim() === 'Post' || b.textContent.trim() === 'ポストする');
    if (p) { p.click(); 'posted'; } else { 'no btn'; }
  `);
  console.log(`  Post result: ${result}`);
  await sleep(2000);

  // Check for graduated-access block
  const url = arc('document.URL');
  if (url.includes('graduated')) {
    console.log('  Blocked by graduated-access');
    return false;
  }
  return true;
}

async function main() {
  console.log('=== X Engagement Session ===');
  console.log(new Date().toISOString());

  // Engage with 5 random keywords
  const shuffled = KEYWORDS.sort(() => Math.random() - 0.5).slice(0, 5);
  for (const kw of shuffled) {
    await engageWithKeyword(kw);
  }

  console.log('=== Done ===');
}

main().catch(console.error);
