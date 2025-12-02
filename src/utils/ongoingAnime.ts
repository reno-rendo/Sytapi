import axios from 'axios';
import { load } from 'cheerio';
import pagination from '../lib/pagination.js';
import scrapeOngoingAnime from '../lib/scapeOngoingAnime.js';

const { BASEURL } = process.env;
const ongoingAnime = async (page: number | string = 1) => {
  const { data } = await  axios.get(`${BASEURL}/ongoing-anime/page/${page}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
    }
  });
  const  $ = load(data);
  const ongoingAnimeEls = $('.venutama .rseries .rapi .venz ul li').toString();
  const ongoingAnimeData = scrapeOngoingAnime(ongoingAnimeEls);
  const paginationData =  pagination($('.pagination').toString());

  return { 
    paginationData,
    ongoingAnimeData
  };
};

export default ongoingAnime;
