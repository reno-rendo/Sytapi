import scrapeSingleAnime from '../lib/scrapeSingleAnime.js';
import type { anime as animeType } from '../types/types.js';
import { getPageContent } from './puppeteerHelper.js';
import fs from 'fs'; // Temporary for debugging

const { BASEURL } = process.env;
const anime = async (slug: string): Promise<animeType | undefined> => {
  const data = await getPageContent(`${BASEURL}/anime/${slug}`);
  fs.writeFileSync('debug.html', data); // Temporary for debugging
  const result = scrapeSingleAnime(data);

  return result;
};

export default anime;