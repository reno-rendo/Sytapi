import 'dotenv/config';
import scrapeGenreLists from '../lib/scrapeGenreLists.js';
import type { genre as genreType } from '../types/types.js';
import { getPageContent } from './puppeteerHelper.js';

const { BASEURL } = process.env;
const genreLists = async (): Promise<genreType[]> => {
  const data = await getPageContent(`${BASEURL}/genre-list`);
  const result = scrapeGenreLists(data);

  return result;
};

export default genreLists;
