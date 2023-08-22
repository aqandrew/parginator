import puppeteer from 'puppeteer';

const sourceURL =
	'https://maximumfun.org/podcasts/secretly-incredibly-fascinating/';

(async () => {
	const browser = await puppeteer.launch({ headless: 'new' });
	const page = await browser.newPage();
	const allEpisodeLinks = [];

	async function getAllEpisodeLinks() {
		await page.goto(sourceURL);

		// go to the last page
		let pageNum = await page.$eval('a.last', (a) => a.dataset.page);
		await page.goto(`${sourceURL}?_paged=${pageNum}`);

		while (pageNum) {
			const episodeLinks = await page.$$eval(
				'.latest-panel-loop-item-title a',
				(links) =>
					links
						.map((link) => link.href)
						.filter((link) => !link.includes('boco'))
			);

			allEpisodeLinks.push(...episodeLinks);
			pageNum--;
		}
	}

	await getAllEpisodeLinks();
	console.log({ allEpisodeLinks });

	// TODO check for Jason Pargin

	await browser.close();
})();
