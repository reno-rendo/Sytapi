import { load } from 'cheerio';
import mapGenres from './mapGenres.js';
import scrapeAnimeEpisodes from './scrapeAnimeEpisodes.js';
import getBatch from './getBatch.js';
import type { anime, episode_list } from '../types/types.js';

const scrapeSingleAnime = (html: string) => {
  const result = createAnimeData(
    html,
    getPoster(html),
    getSynopsis(html),
    scrapeAnimeEpisodes(html)
  );
  return result;
};

const createAnimeData = (
  html: string, poster: string | undefined, synopsis: string | undefined, episode_lists: episode_list[] | undefined
): anime | undefined => {
  const $ = load(html);
  
  const details: { [key: string]: string } = {};
  $('.infozin .infozingle p').each((_, el) => {
    const text = $(el).text();
    const parts = text.split(':');
    if (parts.length > 1) {
      const key = parts[0].trim();
      const value = parts.slice(1).join(':').trim();
      details[key] = value;
    }
  });

  const genres = mapGenres($('.infozin .infozingle p:last span a').toString());
  const batch = getBatch(html);
  const recommendations = getRecomendations($('#recommend-anime-series .isi-recommend-anime-series .isi-konten').toString());

  if(!episode_lists) return undefined;

  return {
    title: details['Judul'],
    japanese_title: details['Japanese'],
    poster,
    rating: details['Skor'],
    produser: details['Produser'],
    type: details['Tipe'],
    status: details['Status'],
    episode_count: details['Total Episode'],
    duration: details['Durasi'],
    release_date: details['Tanggal Rilis'],
    studio: details['Studio'],
    genres,
    synopsis,
    batch,
    episode_lists,
    recommendations
  };
};

const getSynopsis = (html: string) => {
  const $ = load(html);
  const synopsis = $('.sinopc p').map((_, el) => $(el).text()).get().join('\n');
  return synopsis.replace(/&nbsp;/g, ' ');
};

const getPoster = (html: string): string | undefined => {
  const $ = load(html);
  const poster = $('.fotoanime img').attr('src');
  return poster;
};

const getRecomendations = (html: string) => {
  const result: {
    title: string | undefined,
    slug: string | undefined,
    poster: string | undefined,
    otakudesu_url: string | undefined
  }[] = [];
  const animeEls = html.split('</div></div></div>')
    .filter((el) => el.trim() !== '')
    .map((el) => `${el}</div></div></div>`);

  animeEls.forEach((el) => {
    const $ = load(el);
    const title = $('.judul-anime').text();
    const poster = $('.isi-anime img').attr('src');
    const otakudesu_url = $('.isi-anime a').attr('href');
    const slug = otakudesu_url?.replace(/^https:\/\/otakudesu\.[a-zA-Z0-9-]+\/anime\//, '').replace('/', '');
    result.push({
      title,
      slug,
      poster,
      otakudesu_url
    });
  });

  return result;
};

export default scrapeSingleAnime;
