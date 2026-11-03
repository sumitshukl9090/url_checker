const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const csv = require('csv-parser');

// Use the stealth plugin
puppeteer.use(StealthPlugin());

// Read URLs from `urls.csv`
const readCSV = (filePath) => {
    return new Promise((resolve, reject) => {
        const urls = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                const url = Object.values(row)[0]; // Assuming URL is in the first column
                if (url) urls.push(url);
            })
            .on('end', () => resolve(urls))
            .on('error', (error) => reject(error));
    });
};

// Function to check a single URL
const checkVideoStatus = async (page, url) => {
    try {
        console.log(`\n🔍 Checking URL: ${url}`);

        // Navigate to the URL
        const response = await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        // If response is null or HTTP status >= 400, mark as unavailable
        if (!response || response.status() >= 400) {
            console.log(`🚨 HTTP Error ${response ? response.status() : 'Unknown'} → Marking as 0 ❌`);
            return { url, status: '0' };
        }

        // Get the body text of the page
        const bodyText = await page.evaluate(() => document.body.innerText);
        const bodySnippet = bodyText.substring(0, 500); // Log first 500 characters
        console.log(`📄 Body Text Snippet:\n${bodySnippet}\n`);

        // Convert to lowercase for accurate matching
        const lowerText = bodyText.toLowerCase();

        // Define conditions for unavailability
        const videoUnavailable = lowerText.includes("file not found") ||
            lowerText.includes("has been removed due to copyright owner request.") ||
            lowerText.includes("video unavailable") ||
            lowerText.includes("the video you’re trying to view has been taken down in compliance with a dmca") ||
            lowerText.includes("404 page not found") ||
            lowerText.includes("404 / page not found") ||
            lowerText.includes("404 not found") ||
            lowerText.includes("404") ||
            lowerText.includes("403 forbidden") ||
            lowerText.includes("sorry, this video is not available anymore!") ||
            lowerText.includes("buy this domain") ||
            lowerText.includes("the resource you are looking for has been removed or is temporarily unavailable.") ||
            lowerText.includes("sorry! this page does not exist.") ||
            lowerText.includes("sorry, this video has been deleted") ||
            lowerText.includes("that page doesn't exist") ||
            lowerText.includes("The page doesn't exist on this server.") ||
            lowerText.includes("Back to home") ||
            lowerText.includes("the requested page was not found.");

        if (videoUnavailable) {
            console.log(`❌ Unavailable Video → Marking as 0`);
            return { url, status: '0' };
        }

        console.log(`✅ Video Available → Marking as 1`);
        return { url, status: '1' };

    } catch (error) {
        console.error(`⚠️ Error processing ${url}:`, error.message);
        return { url, status: '1' }; // Treat as available on error
    }
};

// Main function
(async () => {
    const urlsFile = 'urls.csv';
    const outputFile = 'testedurls.csv';

    if (!fs.existsSync(urlsFile)) {
        console.error(`❌ File not found: ${urlsFile}`);
        process.exit(1);
    }

    const urls = await readCSV(urlsFile);

    if (urls.length === 0) {
        console.error('❌ No URLs found in the CSV file.');
        process.exit(1);
    }

    console.log(`🔍 Checking ${urls.length} URLs...`);

    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setJavaScriptEnabled(true);

    const results = [];

    for (const url of urls) {
        const result = await checkVideoStatus(page, url);
        results.push(result);
    }

    await browser.close();

    // Write results to `testedurls.csv`
    const csvHeader = 'URL,Status\n';
    const csvData = results.map(({ url, status }) => `${url},${status}`).join('\n');

    fs.writeFileSync(outputFile, csvHeader + csvData);
    console.log(`✅ Results saved to ${outputFile}`);
})();
