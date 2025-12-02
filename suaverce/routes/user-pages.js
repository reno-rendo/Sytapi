const express = require('express');
const router = express.Router();
const db = require('../models/database');
const { isAuthenticated } = require('../middleware/auth');
const animeApi = require('../services/animeApi'); // Assuming animeApi can fetch full anime details by slug

router.use(isAuthenticated); // All routes in this router require authentication

// Helper to fetch full anime details for slugs (e.g., from bookmarks/likes)
async function getFullAnimeDetailsBySlugs(animeSlugs) {
  const animeDetailsPromises = animeSlugs.map(slug => animeApi.getAnimeDetails(slug));
  const detailedAnime = await Promise.all(animeDetailsPromises);
  // Filter out nulls if some anime details can't be fetched
  return detailedAnime.filter(anime => anime !== null);
}

router.get('/bookmarks', async (req, res) => {
  try {
    const userId = req.session.user.id;
    const bookmarkedSlugs = await db.getUserBookmarks(userId);
    
    // Fetch full anime details for each bookmarked slug
    const bookmarkedAnime = await getFullAnimeDetailsBySlugs(bookmarkedSlugs);

    res.render('bookmarks', {
      title: 'Bookmarks - KitaNime',
      description: 'Your bookmarked anime.',
      animeList: bookmarkedAnime,
      currentPage: 'bookmarks'
    });
  } catch (error) {
    console.error('Bookmarks page error:', error);
    res.status(500).render('error', {
      title: 'Terjadi Kesalahan - KitaNime',
      error: {
        status: 500,
        message: 'Tidak dapat memuat daftar bookmark.'
      }
    });
  }
});

router.get('/likes', async (req, res) => {
  try {
    const userId = req.session.user.id;
    const likedSlugs = await db.getUserLikedAnime(userId);

    // Fetch full anime details for each liked slug
    const likedAnime = await getFullAnimeDetailsBySlugs(likedSlugs);

    res.render('likes', {
      title: 'Liked Anime - KitaNime',
      description: 'Your liked anime.',
      animeList: likedAnime,
      currentPage: 'likes'
    });
  } catch (error) {
    console.error('Liked anime page error:', error);
    res.status(500).render('error', {
      title: 'Terjadi Kesalahan - KitaNime',
      error: {
        status: 500,
        message: 'Tidak dapat memuat daftar anime yang disukai.'
      }
    });
  }
});

// Helper to fetch full episode details for history
async function getFullEpisodeDetailsFromHistory(historyItems) {
  const episodeDetailsPromises = historyItems.map(async item => {
    // episode_slug is like "anime-slug-episode-number"
    const parts = item.episode_slug.split('-');
    const episodeNumber = parts.pop(); // last part is episode number
    const animeSlug = parts.join('-'); // rest is anime slug
    
    // Fetch anime details to get title/poster
    const anime = await animeApi.getAnimeDetails(animeSlug);
    if (!anime) return null;

    return {
      animeSlug: animeSlug,
      animeTitle: anime.title,
      animePoster: anime.poster,
      episodeNumber: episodeNumber,
      timestampSeconds: item.timestamp_seconds,
      updatedAt: item.updated_at
    };
  });
  const detailedHistory = await Promise.all(episodeDetailsPromises);
  return detailedHistory.filter(item => item !== null);
}


router.get('/history', async (req, res) => {
  try {
    const userId = req.session.user.id;
    const rawHistory = await db.getUserWatchHistory(userId);
    
    // Enrich history items with anime/episode details
    const watchHistory = await getFullEpisodeDetailsFromHistory(rawHistory);

    res.render('history', {
      title: 'Watch History - KitaNime',
      description: 'Your recent watch history.',
      watchHistory: watchHistory,
      currentPage: 'history'
    });
  } catch (error) {
    console.error('Watch history page error:', error);
    res.status(500).render('error', {
      title: 'Terjadi Kesalahan - KitaNime',
      error: {
        status: 500,
        message: 'Tidak dapat memuat riwayat tontonan.'
      }
    });
  }
});


module.exports = router;
