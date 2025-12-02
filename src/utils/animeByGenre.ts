import axios from 'axios';
import scrapeAnimeByGenre from '../lib/scrapeAnimeByGenre.js';

const { BASEURL } = process.env;
const animeByGenre = async (genre: string, page: number | string = 1) => {
  const response = await axios.get(`${BASEURL}/genres/${genre}/page/${page}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
    }
  });
  const result = scrapeAnimeByGenre(response.data);

  return result;
};

export default animeByGenre;
