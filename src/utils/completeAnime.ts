import { load } from 'cheerio';
import pagination from '../lib/pagination.js';
import scrapeCompleteAnime from '../lib/scrapeCompleteAnime.js';
import { getPageContent } from './puppeteerHelper.js';

const { BASEURL } = process.env;
const completeAnime = async (page: number | string = 1) => {
  const data = await getPageContent(`${BASEURL}/complete-anime/page/${page}`);
  const  $ = load(data);
  const completeAnimeEls = $('.venutama .rseries .rapi .venz ul li').toString();
  const completeAnimeData = scrapeCompleteAnime(completeAnimeEls);
  const paginationData =  pagination($('.pagination').toString());

  return { 
    paginationData,
    completeAnimeData
  };
};

export default completeAnime;
