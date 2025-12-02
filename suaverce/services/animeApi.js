const path = require('path');
const { getActiveApiEndpoint } = require('../models/database');

// Dynamically import the ES module scraper
let otakudesuScraper;
let closePuppeteerBrowser; // To store the closeBrowser function

async function loadOtakudesuScraper() {
  if (!otakudesuScraper) {
    const modulePath = path.resolve(__dirname, '..', 'scrapers', 'otakudesu', 'dist', 'otakudesu.js');
    otakudesuScraper = await import(modulePath);
    otakudesuScraper = otakudesuScraper.default; // Assuming it's a default export

    // Get the closeBrowser function from the helper after loading the scraper
    const puppeteerHelperModulePath = path.resolve(__dirname, '..', 'scrapers', 'otakudesu', 'dist', 'utils', 'puppeteerHelper.js');
    const puppeteerHelper = await import(puppeteerHelperModulePath);
    closePuppeteerBrowser = puppeteerHelper.closeBrowser;
  }
  return otakudesuScraper;
}

class AnimeApiService {
  constructor() {
    this.fallbackEndpointsPath = null; 
    this.apiResponsesPath = null;

    // Register cleanup for Puppeteer browser on application exit
    process.on('exit', async () => {
      if (closePuppeteerBrowser) {
        console.log('Closing Puppeteer browser on exit...');
        await closePuppeteerBrowser();
      }
    });
    // Handle Ctrl+C and other termination signals
    process.on('SIGINT', async () => {
      if (closePuppeteerBrowser) {
        console.log('Closing Puppeteer browser on SIGINT...');
        await closePuppeteerBrowser();
      }
      process.exit(0);
    });
    process.on('SIGTERM', async () => {
      if (closePuppeteerBrowser) {
        console.log('Closing Puppeteer browser on SIGTERM...');
        await closePuppeteerBrowser();
      }
      process.exit(0);
    });
  }

  async getApiBaseUrl() {
    return process.env.BASEURL || 'https://otakudesu.best';
  }

  async getHomeData() {
    try {
      const scraper = await loadOtakudesuScraper();
      const data = await scraper.home();
      return data;
    } catch (error) {
      console.error('Error in getHomeData:', error);
      return { ongoing_anime: [], complete_anime: [] };
    }
  }

  async getOngoingAnime(page = 1) {
    try {
      const scraper = await loadOtakudesuScraper();
      const result = await scraper.ongoingAnime(page);
      return {
        data: result.ongoingAnimeData || [],
        pagination: result.paginationData || { current_page: page, total_pages: 1 }
      };
    } catch (error) {
      console.error('Error in getOngoingAnime:', error);
      return { data: [], pagination: { current_page: page, total_pages: 1 } };
    }
  }

  async getCompleteAnime(page = 1) {
    try {
      const scraper = await loadOtakudesuScraper();
      const result = await scraper.completeAnime(page);
      return {
        data: result.completeAnimeData || [],
        pagination: result.paginationData || { current_page: page, total_pages: 1 }
      };
    } catch (error) {
      console.error('Error in getCompleteAnime:', error);
      return { data: [], pagination: { current_page: page, total_pages: 1 } };
    }
  }

  async getMovies(page = 1) {
    console.warn('getMovies is not directly supported by Otakudesu scraper. Returning empty data.');
    return { data: { movies: [] }, pagination: { current_page: page, total_pages: 1 } };
  }

  async getMovieDetails(year, month, slug) {
    console.warn('getMovieDetails is not directly supported by Otakudesu scraper. Returning empty data.');
    return null;
  }

  async getAnimeDetails(slug) {
    try {
      const scraper = await loadOtakudesuScraper();
      const data = await scraper.anime(slug);
      return data;
    } catch (error) {
      console.error(`Error in getAnimeDetails for slug ${slug}:`, error);
      return null;
    }
  }

  async getAnimeEpisodes(slug) {
    try {
      const scraper = await loadOtakudesuScraper();
      const data = await scraper.episodes(slug);
      return data || [];
    } catch (error) {
      console.error(`Error in getAnimeEpisodes for slug ${slug}:`, error);
      return [];
    }
  }

  async getEpisodeDetails(slug, episodeNumber) {
    try {
      const scraper = await loadOtakudesuScraper();
      const data = await scraper.episode({ animeSlug: slug, episodeNumber: episodeNumber });
      return data;
    } catch (error) {
      console.error(`Error in getEpisodeDetails for slug ${slug}, episode ${episodeNumber}:`, error);
      return null;
    }
  }

  async searchAnime(keyword, page = 1) {
    try {
      const scraper = await loadOtakudesuScraper();
      const data = await scraper.search(keyword);
      return {
        data: data || [],
        pagination: { current_page: page, total_pages: 1 }
      };
    } catch (error) {
      console.error(`Error in searchAnime for keyword ${keyword}:`, error);
      return { data: [], pagination: { current_page: page, total_pages: 1 } };
    }
  }

  async getGenres() {
    try {
      const scraper = await loadOtakudesuScraper();
      const data = await scraper.genreLists();
      return data || [];
    } catch (error) {
      console.error('Error in getGenres:', error);
      return [];
    }
  }

  async getAnimeByGenre(genreSlug, page = 1) {
    try {
      const scraper = await loadOtakudesuScraper();
      const data = await scraper.animeByGenre(genreSlug, page);
      return {
        anime: data || [],
        genre_name: data && data[0] ? data[0].genres[0].title : genreSlug,
        pagination: { current_page: page, total_pages: 1 }
      };
    } catch (error) {
      console.error(`Error in getAnimeByGenre for genre ${genreSlug}:`, error);
      return { anime: [], genre_name: genreSlug, pagination: { current_page: page, total_pages: 1 } };
    }
  }

  validateAnimeData(data, slug = null) {
    if (!data) return null;
    const sanitized = {
      title: this.sanitizeString(data.title),
      slug: slug !== null ? slug : this.sanitizeSlug(data.slug),
      poster: this.sanitizeUrl(data.poster),
      synopsis: this.sanitizeString(data.synopsis),
      genres: Array.isArray(data.genres) ? data.genres : [],
      status: this.sanitizeString(data.status),
      rating: data.rating ? parseFloat(data.rating) : null,
      release_year: data.release_year ? parseInt(data.release_year) : null,
      episodes: Array.isArray(data.episode_lists) ? data.episode_lists : []
    };

    return sanitized;
  }

  sanitizeString(str) {
    if (typeof str !== 'string') return '';
    return str.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }

  sanitizeUrl(url) {
    if (typeof url !== 'string') return '';
    try {
      new URL(url);
      return url;
    } catch {
      return '';
    }
  }

  sanitizeSlug(slug) {
    if (typeof slug !== 'string') return '';
    return slug.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-');
  }

  generateAnimeUrl(slug, episode = null) {
    const baseUrl = '/anime/' + this.sanitizeSlug(slug);
    return episode ? `${baseUrl}/episode/${episode}` : baseUrl;
  }
}

module.exports = new AnimeApiService();
