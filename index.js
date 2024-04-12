import puppeteer from 'puppeteer';

const sourceURL =
	'https://maximumfun.org/podcasts/secretly-incredibly-fascinating/';
const guest = 'Jason Pargin';

(async () => {
	const browser = await puppeteer.launch({ headless: 'new' });
	const page = await browser.newPage();
	const allEpisodesWithGuest = [];

	async function main() {
		await page.goto(sourceURL);

		// go to the last page
		// can't use page.click() because the pagination anchors don't have hrefs
		let pageNum = await page.$eval('a.last', (a) => a.dataset.page);

		while (pageNum) {
			// TODO add ora spinner
			console.log(`Checking page ${pageNum}...`);

			await page.goto(`${sourceURL}?_paged=${pageNum}`);

			const episodeLinks = await page.$$eval(
				'.latest-panel-loop-item-title a',
				(links) =>
					links
						.map((link) => link.href)
						.filter((link) => !link.includes('boco'))
			);

			const episodesWithGuest = await getEpisodesWithGuest(episodeLinks);
			allEpisodesWithGuest.push(...episodesWithGuest);
			pageNum--;
		}

		// TODO write this to a text file
		console.log({ allEpisodesWithGuest });
	}

	async function getEpisodesWithGuest(episodeLinks) {
		const episodesWithGuest = [];

		for (const link of episodeLinks) {
			await page.goto(link);

			try {
				const guestText = await page.$eval(
					'#single-episode-guests',
					(el) => el.textContent
				);

				if (guestText.includes(guest)) {
					episodesWithGuest.push(link);
				}
			} catch (error) {
				// continue if no matching element was found
			}
		}

		return episodesWithGuest;
	}

	await main();
	await browser.close();
})();
