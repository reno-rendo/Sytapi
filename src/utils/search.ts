import axios from 'axios';
import scrapesearchresult from '../lib/scrapeSearchResult.js';
import { searchResultAnime } from '../types/types.js';

const { BASEURL } = process.env;
const search = async (keyword: string): Promise<searchResultAnime[]> => {
  const response = await axios.get(`${BASEURL}/?s=${keyword}&post_type=anime`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
    }
  });
  const html = response.data;
  const searchResult = scrapesearchresult(html);
  return searchResult;
};

export default search;
