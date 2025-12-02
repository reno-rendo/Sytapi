import axios from 'axios';
import scrapeSingleAnime from '../lib/scrapeSingleAnime.js';
import type { anime as animeType } from '../types/types.js';

const { BASEURL } = process.env;
const anime = async (slug: string): Promise<animeType | undefined> => {
  const { data } = await axios.get(`${BASEURL}/anime/${slug}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
    }
  });
  const result = scrapeSingleAnime(data);

  return result;
};

export default anime;