import scrapesearchresult from '../lib/scrapeSearchResult.js';
import { searchResultAnime } from '../types/types.js';
import { getPageContent } from './puppeteerHelper.js';

const { BASEURL } = process.env;
const search = async (keyword: string): Promise<searchResultAnime[]> => {
  const html = await getPageContent(`${BASEURL}/?s=${keyword}&post_type=anime`);
  const searchResult = scrapesearchresult(html);
  return searchResult;
};

export default search;
