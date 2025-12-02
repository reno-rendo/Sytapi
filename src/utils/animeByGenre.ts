import scrapeAnimeByGenre from '../lib/scrapeAnimeByGenre.js';
import { getPageContent } from './puppeteerHelper.js';

const { BASEURL } = process.env;
const animeByGenre = async (genre: string, page: number | string = 1) => {
  const data = await getPageContent(`${BASEURL}/genres/${genre}/page/${page}`);
  const result = scrapeAnimeByGenre(data);

  return result;
};

export default animeByGenre;
