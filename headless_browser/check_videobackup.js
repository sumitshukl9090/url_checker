const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

// Use the stealth plugin
puppeteer.use(StealthPlugin());

(async () => {
    const url = process.argv[2]; // URL passed as an argument
    const browser = await puppeteer.launch({
            headless: true, // Run in headless mode for performance
            args: [
                '--no-sandbox', // Disable the sandbox for running in cloud environments
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage', // Prevent shared memory issues
                '--disable-extensions',
                '--disable-background-networking',
                '--disable-renderer-backgrounding',
                '--disable-sync',
                '--disable-gpu'
            ],
            timeout: 60000 // Timeout for launching the browser
        });
    const page = await browser.newPage();

    try {
        // Navigate to the URL
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

        // Get the body text of the page
        const bodyText = await page.evaluate(() => document.body.innerText);
        console.log('bodytxt:', bodyText);
        // Define the conditions for unavailability
        const videoUnavailable = bodyText.includes("File Not Found") ||
      
            bodyText.includes("has been removed due to copyright owner request.") ||
            bodyText.includes("deleted") ||
            bodyText.includes("Video unavailable") ||
            bodyText.includes("The video you’re trying to view has been taken down in compliance with a DMCA") ||
            bodyText.includes("404 page not found") ||
            bodyText.includes("404 / Page not found") ||
            bodyText.includes("404 / page not found") ||
            bodyText.includes("404 Not Found") ||
            bodyText.includes("403 Forbidden") ||
            bodyText.includes("Sorry, this video is not available anymore!") ||
            bodyText.includes("404Page not found") ||
            bodyText.includes("Buy this Domain") ||
            bodyText.includes("The resource you are looking for has been removed or is temporarily unavailable.") ||
            bodyText.includes("Sorry! This page does not exist.") ||
            bodyText.includes("Sorry, this video has been deleted") ||
            bodyText.includes("That page doesn't exist") || 
            bodyText.includes("The requested page was not found.");
    
        // Mark 0 if the page matches the unavailability conditions
        if (videoUnavailable) {
            console.log('0');
        } else {
            // If conditions do not match, mark as available
            console.log('1');
        }
    } catch (error) {
        // Handle errors or timeouts by marking as available
        console.error('Error while checking the URL:', error);
        console.log('1'); // Treat as available on error
    } finally {
        // Close the browser
        await browser.close();
    }
})();