import axios from 'axios';
import scrapeAnimeEpisodes from '../lib/scrapeAnimeEpisodes.js';
import type { episode_list } from '../types/types.js';

const { BASEURL } = process.env;
const episodes = async (slug: string): Promise<episode_list[] | undefined> => {
  const { data } = await axios.get(`${BASEURL}/anime/${slug}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
    }
  });
  const result = scrapeAnimeEpisodes(data);

  return result;
};

export default episodes;
