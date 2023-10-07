const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');
const archiver = require('archiver');
const path = require('path');

const baseURL = 'https://topangalumber.com'; // Replace with the WordPress site URL
const outputDir = 'C:/Users/nuwud/Downloads'; // Directory to save scraped content and images

// Function to scrape a single page
async function scrapePage(pageURL) {
  try {
    const response = await axios.get(pageURL);
    const html = response.data;
    const $ = cheerio.load(html);
    const content = [];
    const imageLinks = [];

    // Extracting text content
    $('p').each((index, element) => {
      content.push($(element).text());
    });

    // Extracting image URLs
    $('img').each((index, element) => {
      imageLinks.push($(element).attr('src'));
    });

    // Adjusting image URLs
    imageLinks.forEach((link, index) => {
      if (!link.startsWith('http')) {
        imageLinks[index] = baseURL + link;
      }
    });

    // Downloading images
    for (const link of imageLinks) {
      const filename = path.basename(link);
      const imagePath = path.join(outputDir, 'images', filename);

      const imageResponse = await axios.get(link, { responseType: 'stream' });
      imageResponse.data.pipe(fs.createWriteStream(imagePath));
    }

    // Saving the scraped content to a temporary file
    const tempFilePath = path.join(outputDir, 'temp', 'scraped_content.txt');
    fs.writeFileSync(tempFilePath, content.join('\n'));

    return tempFilePath;
  } catch (error) {
    console.error(`Error scraping page ${pageURL}:`, error.message);
    return null;
  }
}

// Function to scrape all pages listed in a sitemap
async function scrapeSitemapPages(sitemapURL) {
  try {
    const response = await axios.get(sitemapURL);
    const $ = cheerio.load(response.data);
    const pageURLs = [];

    // Extracting page URLs from the sitemap
    $('urlset url loc').each((index, element) => {
      pageURLs.push($(element).text());
    });

    // Scraping each page
    const scrapedFilePaths = [];
    for (const pageURL of pageURLs) {
      const scrapedFilePath = await scrapePage(pageURL);
      if (scrapedFilePath) {
        scrapedFilePaths.push(scrapedFilePath);
      }
    }

    // Compress the scraped files to a .zip file
    const zipFilePath = path.join(outputDir, 'scraped_content.zip');
    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver('zip', {
      zlib: { level: 9 },
    });

    output.on('close', () => {
      console.log(`${archive.pointer()} total bytes`);
      console.log('Scraped content saved and compressed successfully!');
    });

    archive.on('error', (err) => {
      throw err;
    });

    archive.pipe(output);

    for (const filePath of scrapedFilePaths) {
      archive.file(filePath, { name: path.basename(filePath) });
    }

    archive.finalize();
  } catch (error) {
    console.error(`Error scraping sitemap ${sitemapURL}:`, error.message);
  }
}

// ...

// Function to scrape all sitemaps listed in the main sitemap
async function scrapeAllSitemaps(mainSitemapURL) {
  try {
    const response = await axios.get(mainSitemapURL);
    const $ = cheerio.load(response.data);

    // Extracting sub-sitemap URLs from the main sitemap
    const subSitemapURLs = [];

    // Extracting sub-sitemap URLs from the main sitemap
    $('loc').each((index, element) => {
      const sitemapURL = $(element).text();
      if (sitemapURL.endsWith('.xml')) {
        subSitemapURLs.push(sitemapURL);
      }
    });

    // Scraping pages from sub-sitemaps
    const scrapedFilePaths = [];
    for (const subSitemapURL of subSitemapURLs) {
      const scrapedFilePath = await scrapeSitemapPages(subSitemapURL);
      if (scrapedFilePath) {
        scrapedFilePaths.push(scrapedFilePath);
      }
    }

    // Compress the scraped files to a .zip file
    const zipFilePath = path.join(outputDir, 'scraped_content.zip');
    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver('zip', {
      zlib: { level: 9 },
    });

    output.on('close', () => {
      console.log(`${archive.pointer()} total bytes`);
      console.log('Scraped content saved and compressed successfully!');
    });

    archive.on('error', (err) => {
      throw err;
    });

    archive.pipe(output);

    for (const filePath of scrapedFilePaths) {
      archive.file(filePath, { name: path.basename(filePath) });
    }

    archive.finalize();
  } catch (error) {
    console.error(`Error scraping main sitemap ${mainSitemapURL}:`, error.message);
  }
}

// Start scraping sitemaps
const mainSitemapURL = 'https://topangalumber.com/wp-sitemap.xml'; // Replace with the main sitemap URL
scrapeAllSitemaps(mainSitemapURL);

// Function to scrape pages from a sub-sitemap
async function scrapeSitemapPages(subSitemapURL) {
  try {
    const response = await axios.get(subSitemapURL);
    const $ = cheerio.load(response.data);

    const content = [];

    // Extracting URLs from the sub-sitemap
    $('loc').each((index, element) => {
      const pageURL = $(element).text();
      content.push(pageURL);
    });

    // Define a folder path to save the scraped pages for each sub-sitemap
    const subSitemapName = path.basename(subSitemapURL, '.xml');
    const subSitemapFolderPath = path.join(outputDir, subSitemapName);

    // Create the folder if it doesn't exist
    if (!fs.existsSync(subSitemapFolderPath)) {
      fs.mkdirSync(subSitemapFolderPath);
    }

    // Save the scraped content to a file for each sub-sitemap
    const subSitemapFilePath = path.join(subSitemapFolderPath, 'scraped_content.txt');
    fs.writeFileSync(subSitemapFilePath, content.join('\n'));

    console.log(`Scraped ${content.length} pages from ${subSitemapURL}`);

    return subSitemapFilePath;
  } catch (error) {
    console.error(`Error scraping sub-sitemap ${subSitemapURL}:`, error.message);
    return null;
  }
}

// ...

// Output directory where scraped content will be saved
const outputDir = 'C:\\Users\\nuwud\\Downloads';

// Start scraping sitemaps
const mainSitemapURL = 'https://topangalumber.com/wp-sitemap.xml'; // Replace with the main sitemap URL
scrapeAllSitemaps(mainSitemapURL);

// ...

// Function to scrape all sitemaps
async function scrapeAllSitemaps(mainSitemapURL) {
  try {
    const response = await axios.get(mainSitemapURL);
    const $ = cheerio.load(response.data);

    // Extracting URLs of sub-sitemaps from the main sitemap
    const subSitemapURLs = [];
    $('loc').each((index, element) => {
      const url = $(element).text();
      if (url.endsWith('.xml') && !url.includes('sitemap-index')) {
        subSitemapURLs.push(url);
      }
    });

    // Scrape pages from each sub-sitemap
    const scrapedFilePaths = [];
    for (const subSitemapURL of subSitemapURLs) {
      const subSitemapFilePath = await scrapeSitemapPages(subSitemapURL);
      if (subSitemapFilePath) {
        scrapedFilePaths.push(subSitemapFilePath);
      }
    }

    // Compress all scraped files into a single zip file
    const outputZipFilePath = path.join(outputDir, 'scraped_content.zip');
    const output = fs.createWriteStream(outputZipFilePath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      console.log(`${archive.pointer()} total bytes`);
      console.log('All scraped content saved and compressed successfully!');
    });

    archive.on('error', (err) => {
      throw err;
    });

    archive.pipe(output);

    // Add all scraped files to the zip archive
    for (const filePath of scrapedFilePaths) {
      archive.file(filePath, { name: path.basename(filePath) });
    }

    archive.finalize();
  } catch (error) {
    console.error('Error scraping sitemaps:', error.message);
  }
}

// Output directory where scraped content will be saved
const outputDir = 'C:\\Users\\nuwud\\Downloads';

// Start scraping sitemaps
const mainSitemapURL = 'https://topangalumber.com/wp-sitemap.xml'; // Replace with the main sitemap URL
scrapeAllSitemaps(mainSitemapURL);

// ...

// Function to scrape all sitemaps
async function scrapeAllSitemaps(mainSitemapURL) {
  try {
    const response = await axios.get(mainSitemapURL);
    const $ = cheerio.load(response.data);

    // Extracting URLs of sub-sitemaps from the main sitemap
    const subSitemapURLs = [];
    $('loc').each((index, element) => {
      const url = $(element).text();
      if (url.endsWith('.xml') && !url.includes('sitemap-index')) {
        subSitemapURLs.push(url);
      }
    });

    // Scrape pages from each sub-sitemap
    const scrapedFilePaths = [];
    for (const subSitemapURL of subSitemapURLs) {
      const subSitemapFilePath = await scrapeSitemapPages(subSitemapURL);
      if (subSitemapFilePath) {
        scrapedFilePaths.push(subSitemapFilePath);
      }
    }

    // Compress all scraped files into a single zip file
    const outputZipFilePath = path.join(outputDir, 'scraped_content.zip');
    const output = fs.createWriteStream(outputZipFilePath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      console.log(`${archive.pointer()} total bytes`);
      console.log('All scraped content saved and compressed successfully!');
    });

    archive.on('error', (err) => {
      throw err;
    });

    archive.pipe(output);

    // Add all scraped files to the zip archive
    for (const filePath of scrapedFilePaths) {
      archive.file(filePath, { name: path.basename(filePath) });
    }

    archive.finalize();
  } catch (error) {
    console.error('Error scraping sitemaps:', error.message);
  }
}

// Function to scrape pages from a sitemap URL
async function scrapeSitemapPages(sitemapURL) {
  try {
    const response = await axios.get(sitemapURL);
    const $ = cheerio.load(response.data);

    // Extract URLs of individual pages from the sitemap
    const pageURLs = [];
    $('loc').each((index, element) => {
      const url = $(element).text();
      pageURLs.push(url);
    });

    // Scrape and save content from each page
    const scrapedContent = [];
    for (const pageURL of pageURLs) {
      const pageResponse = await axios.get(pageURL);
      const pageHtml = pageResponse.data;
      scrapedContent.push(pageHtml);
    }

    // Save scraped content to a file
    const fileName = sitemapURL.split('/').slice(-1)[0].replace('.xml', '.txt');
    const filePath = path.join(outputDir, fileName);

    fs.writeFileSync(filePath, scrapedContent.join('\n'));

    console.log(`Scraped content saved for ${sitemapURL}`);
    return filePath;
  } catch (error) {
    console.error(`Error scraping page ${sitemapURL}:`, error.message);
    return null;
  }
}

// Output directory where scraped content will be saved
const outputDir = 'C:\\Users\\nuwud\\Downloads';

// Start scraping sitemaps
const mainSitemapURL = 'https://topangalumber.com/wp-sitemap.xml'; // Replace with the main sitemap URL
scrapeAllSitemaps(mainSitemapURL);
