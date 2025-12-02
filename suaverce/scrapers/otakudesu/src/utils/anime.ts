import scrapeSingleAnime from '../lib/scrapeSingleAnime.js';
import type { anime as animeType } from '../types/types.js';
import { getPageContent } from './puppeteerHelper.js';

const { BASEURL } = process.env;
const anime = async (slug: string): Promise<animeType | undefined> => {
  const data = await getPageContent(`${BASEURL}/anime/${slug}`);
  const result = scrapeSingleAnime(data);

  return result;
};

export default anime;