import axios from 'axios';
import 'dotenv/config';
import scrapeGenreLists from '../lib/scrapeGenreLists.js';
import type { genre as genreType } from '../types/types.js';

const { BASEURL } = process.env;
const genreLists = async (): Promise<genreType[]> => {
  const response = await axios.get(`${BASEURL}/genre-list`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
    }
  });
  const result = scrapeGenreLists(response.data);

  return result;
};

export default genreLists;
