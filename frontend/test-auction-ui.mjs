import { chromium } from 'playwright';
import path from 'path';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Logging in as Organizer...');
  await page.goto('http://localhost:3000/login');
  await page.fill('input[type="email"]', 'john@example.com'); // Organizer
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL('http://localhost:3000/dashboard');

  console.log('Navigating to first tournament...');
  await page.goto('http://localhost:3000/tournaments');
  await page.waitForTimeout(2000);
  const firstTournament = await page.$('.tournament-card'); // Fallback logic needed if no class
  
  // Directly navigate to a known tournament id if accessible, or just click the first link
  const links = await page.$$('a[href^="/tournaments/"]');
  if(links.length > 0) {
      const href = await links[0].getAttribute('href');
      console.log('Going to', href);
      await page.goto('http://localhost:3000' + href + '?tab=auction');
      await page.waitForTimeout(2000);
      
      console.log('Taking screenshot of Auction Tab...');
      await page.screenshot({ path: path.join('/Users/sheikhhemayoou08/.gemini/antigravity/brain/8339bb59-b586-4823-878a-49a64839f61b', 'auction_tab_organizer.webp')});
  } else {
      console.log("No tournaments found on page");
  }

  await browser.close();
  console.log('Auction Verification Complete.');
})();
