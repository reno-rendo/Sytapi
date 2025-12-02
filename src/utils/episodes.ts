import scrapeAnimeEpisodes from '../lib/scrapeAnimeEpisodes.js';
import type { episode_list } from '../types/types.js';
import { getPageContent } from './puppeteerHelper.js';

const { BASEURL } = process.env;
const episodes = async (slug: string): Promise<episode_list[] | undefined> => {
  const data = await getPageContent(`${BASEURL}/anime/${slug}`);
  const result = scrapeAnimeEpisodes(data);

  return result;
};

export default episodes;
