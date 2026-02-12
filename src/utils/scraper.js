import puppeteer from 'puppeteer';
import mongoose from 'mongoose';
import { globSync } from 'glob';
import Product from '../api/models/products.js' // ✅ Correct: Move up one folder to find api/import 'dotenv/config';

export const scrapeProducts = async () => {
  console.log('--- 🚀 Starting Scraper ---');
  
  let browser;
  try {
    let executablePath = null;
    if (process.env.RENDER) {
      const foundPaths = globSync('/opt/render/.cache/puppeteer/**/chrome-linux64/chrome');
      if (foundPaths.length > 0) {
        executablePath = foundPaths[0];
        console.log('✅ Chrome found at:', executablePath);
      } else {
        console.error('❌ Chrome NOT found in cache. Check postinstall script.');
      }
    }

    // 2. LAUNCH BROWSER
    browser = await puppeteer.launch({
      executablePath: executablePath, // Uses found path or default locally
      headless: "new",
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--single-process'
      ]
    });

    const page = await browser.newPage();
    
    // Set a user agent to avoid being blocked
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');

    // 3. YOUR SCRAPING LOGIC
    await page.goto('https://example-pet-store.com/dogs', { waitUntil: 'networkidle2' });

    const products = await page.evaluate(() => {
      // Example logic: adjust to the site you are scraping
      const items = document.querySelectorAll('.product-card');
      return Array.from(items).map(item => ({
        name: item.querySelector('.title')?.innerText,
        price: item.querySelector('.price')?.innerText,
        imageUrl: item.querySelector('img')?.src
      }));
    });

    // 4. SAVE TO DATABASE
    for (const item of products) {
      await Product.updateOne(
        { name: item.name }, 
        { $set: item }, 
        { upsert: true }
      );
    }

    console.log(`✅ Scraped and saved ${products.length} products.`);

  } catch (error) {
    console.error('🚨 Scraper Error:', error.message);
  } finally {
    if (browser) await browser.close();
    console.log('--- 🏁 Scraper Finished ---');
  }
};