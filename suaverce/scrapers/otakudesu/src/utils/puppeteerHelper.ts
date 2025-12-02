// suaverce/scrapers/otakudesu/src/utils/puppeteerHelper.ts
import puppeteer, { Browser } from 'puppeteer';

let browserInstance: Browser | null = null;

const initializeBrowser = async (): Promise<Browser> => {
  if (!browserInstance) {
    browserInstance = await puppeteer.launch({
      headless: true, // Set to 'new' or false for headful testing if needed
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }
  return browserInstance;
};

export const getPageContent = async (url: string): Promise<string> => {
  const browser = await initializeBrowser();
  const page = await browser.newPage();
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    const content = await page.content();
    return content;
  } catch (error) {
    console.error(`Puppeteer error when navigating to ${url}:`, error);
    throw error;
  } finally {
    if (page) {
      await page.close();
    }
  }
};

export const closeBrowser = async () => {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
    console.log('Puppeteer browser instance closed.');
  }
};
