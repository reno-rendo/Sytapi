import { load } from 'cheerio';
import type { episode_list } from '../types/types.js';

const scrapeAnimeEpisodes = (html: string): episode_list[] | undefined => {
  const result: episode_list[] = [];
  const $ = load(html);
  
  // Find all <li> elements within the second .episodelist's <ul>
  const listItems = $('.episodelist:nth-child(2) ul li');

  // If the selector above fails, it might be because there's only one episodelist.
  // Fallback to the first one found.
  if (!listItems.length) {
    const fallbackItems = $('.episodelist ul li');
    if(!fallbackItems.length) return undefined;

    fallbackItems.each((_, el) => {
      const a = $(el).find('span:first a');
      result.unshift({
        episode: a?.text(),
        slug: a?.attr('href')?.replace(/^https:\/\/otakudesu\.[a-zA-Z0-9-]+\/episode\//, '').replace('/', ''),
        otakudesu_url: a?.attr('href')
      });
    });
  } else {
    listItems.each((_, el) => {
      const a = $(el).find('span:first a');
      result.unshift({
        episode: a?.text(),
        slug: a?.attr('href')?.replace(/^https:\/\/otakudesu\.[a-zA-Z0-9-]+\/episode\//, '').replace('/', ''),
        otakudesu_url: a?.attr('href')
      });
    });
  }


  return result;
};

export default scrapeAnimeEpisodes;
