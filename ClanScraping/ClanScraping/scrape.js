const puppeteer = require('puppeteer');

async function scrapeRuneScapeClanData() {
    const browser = await puppeteer.launch(); // Launch the browser in headless mode
    const page = await browser.newPage(); // Open a new page

    const baseUrl = 'https://secure.runescape.com/m=clan-hiscores/members.ws?clanName=Nomad&page='; // URL base
    let currentPage = 1;
    let hasMorePages = true;

    // Create a CSV string to store the data
    let csvData = 'Player Name,Rank,Total XP\n';

    while (hasMorePages) {
        const url = baseUrl + currentPage; // Construct the URL for the current page
        await page.goto(url, { waitUntil: 'domcontentloaded' }); // Wait for the page to load

        // Extract player data from the page
        const players = await page.evaluate(() => {
            const rows = document.querySelectorAll('tr.playerRow');
            const playerData = [];

            rows.forEach(row => {
                const name = row.querySelector('td a').innerText.trim();
                const rank = row.querySelectorAll('td')[1].innerText.trim();
                const xp = row.querySelectorAll('td')[2].innerText.trim();
                playerData.push({ name, rank, xp });
            });

            return playerData;
        });

        // If players are found, add them to the CSV data
        if (players.length > 0) {
            players.forEach(player => {
                csvData += `${player.name},${player.rank},${player.xp}\n`;
            });
            currentPage++; // Go to the next page
        } else {
            hasMorePages = false; // Stop if no players are found (end of pages)
        }
    }

    // Output the CSV data to the console
    console.log(csvData);

    // Optionally, you can write this to a file
    const fs = require('fs');
    fs.writeFileSync('runeScapeClanData.csv', csvData);

    await browser.close(); // Close the browser
}

scrapeRuneScapeClanData();
