const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

// Use the stealth plugin
puppeteer.use(StealthPlugin());

(async () => {
    const url = process.argv[2]; // URL passed as an argument
    //const browser = await puppeteer.launch({ headless: true, timeout: 60000 });
    // const browser = await puppeteer.launch({
    //   headless: true,
    //  args: ['--no-sandbox', '--disable-setuid-sandbox'],
    //  timeout: 60000
    //});

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
            '--disable-gpu',
            '--ignore-certificate-errors',
        ],
        timeout: 60000 // Timeout for launching the browser
    });


    const page = await browser.newPage();
    const delay = (time) => new Promise((resolve) => setTimeout(resolve, time));

    try {
        // Navigate to the URL with Multiple Tries
        let maxRetries = 5;
        let retryCount = 0;
        let pageLoaded = false;

        while (retryCount < maxRetries && !pageLoaded) {
            try {
                await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
                pageLoaded = true;
            } catch (error) {
                retryCount++;
            }
        }
        await delay(1000);

        // Navigate to the URL
        // await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

        // Get the body text of the page
        const bodyText = await page.evaluate(() => document.body.innerText);
        //console.log('bodytxt:', bodyText);

        // Define the conditions for unavailability
        const videoUnavailable = bodyText.includes("File Not Found") ||
            //bodyText.includes("404") ||
            bodyText.includes("has been removed due to copyright owner request.") ||
            bodyText.includes("deleted") ||
            bodyText.includes("Video unavailable") ||
            bodyText.includes("404 page not found") ||
            bodyText.includes("404 / Page not found") ||
            bodyText.includes("404 / page not found") ||
            bodyText.includes("404 Not Found") ||
            bodyText.includes("Sorry, this video is not available anymore!") ||
            bodyText.includes("404Page not found") ||
            bodyText.includes("Buy this Domain") ||
            bodyText.includes("The video you�re trying to view has been taken down in compliance with a DMCA") ||
            bodyText.includes("The video you’re trying to view has been taken down in compliance with a DMCA") ||
            bodyText.includes("The resource you are looking for has been removed or is temporarily unavailable.") ||
            bodyText.includes("Sorry! This page does not exist.") ||
            bodyText.includes("Sorry, this video has been deleted") ||
            bodyText.includes("This Content has been blocked for legal reasons.") ||
            bodyText.includes("That page doesn't exist") ||
            bodyText.includes("This Video has been Deleted") ||
            bodyText.includes("Sorry, this video was deleted per copyright owner request.") ||
            bodyText.includes("Video has been deleted") ||
            bodyText.includes("The requested post could not be found.") ||
            bodyText.includes("Oops! We ran into some problems. | LPSG") ||
            bodyText.includes("object you are looking for could not be found.") ||
            bodyText.includes("The requested page was not found.") || 
            bodyText.includes("You must be logged-in to do that.");


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
