const express = require('express');
const router = express.Router();
const db = require('../models/database');
const { isAuthenticated } = require('../middleware/auth'); // Assuming you have this middleware

// All routes in this router require authentication
router.use(isAuthenticated);

// POST /api/user/bookmark - Toggle bookmark status for an anime
router.post('/bookmark', async (req, res) => {
  const { animeSlug } = req.body;
  const userId = req.session.user.id;

  if (!animeSlug) {
    return res.status(400).json({ success: false, message: 'Anime slug is required.' });
  }

  try {
    const bookmarked = await db.isBookmarked(userId, animeSlug);
    if (bookmarked) {
      await db.removeBookmark(userId, animeSlug);
      res.json({ success: true, action: 'removed', message: 'Bookmark removed.' });
    } else {
      await db.addBookmark(userId, animeSlug);
      res.json({ success: true, action: 'added', message: 'Bookmark added.' });
    }
  } catch (error) {
    console.error('Bookmark toggle error:', error);
    res.status(500).json({ success: false, message: 'Failed to toggle bookmark status.' });
  }
});

// POST /api/user/like - Toggle like status for an anime
router.post('/like', async (req, res) => {
  const { animeSlug } = req.body;
  const userId = req.session.user.id;

  if (!animeSlug) {
    return res.status(400).json({ success: false, message: 'Anime slug is required.' });
  }

  try {
    const liked = await db.isAnimeLiked(userId, animeSlug);
    if (liked) {
      await db.removeAnimeLike(userId, animeSlug);
      res.json({ success: true, action: 'removed', message: 'Anime unliked.' });
    } else {
      await db.addAnimeLike(userId, animeSlug);
      res.json({ success: true, action: 'added', message: 'Anime liked.' });
    }
  } catch (error) {
    console.error('Like toggle error:', error);
    res.status(500).json({ success: false, message: 'Failed to toggle like status.' });
  }
});

// POST /api/user/history - Save watch progress for an episode
router.post('/history', async (req, res) => {
  const { episodeSlug, timestamp } = req.body;
  const userId = req.session.user.id;

  if (!episodeSlug || timestamp === undefined) {
    return res.status(400).json({ success: false, message: 'Episode slug and timestamp are required.' });
  }

  try {
    await db.upsertWatchHistory(userId, episodeSlug, timestamp);
    res.json({ success: true, message: 'Watch progress saved.' });
  } catch (error) {
    console.error('Watch history save error:', error);
    res.status(500).json({ success: false, message: 'Failed to save watch progress.' });
  }
});

// GET /api/user/bookmarks - Get user's bookmarks
router.get('/bookmarks', async (req, res) => {
  const userId = req.session.user.id;
  try {
    const bookmarks = await db.getUserBookmarks(userId);
    res.json({ success: true, data: bookmarks });
  } catch (error) {
    console.error('Get bookmarks error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve bookmarks.' });
  }
});

// GET /api/user/likes - Get user's liked anime
router.get('/likes', async (req, res) => {
  const userId = req.session.user.id;
  try {
    const likedAnime = await db.getUserLikedAnime(userId);
    res.json({ success: true, data: likedAnime });
  } catch (error) {
    console.error('Get liked anime error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve liked anime.' });
  }
});

// GET /api/user/history - Get user's watch history
router.get('/history', async (req, res) => {
  const userId = req.session.user.id;
  try {
    const watchHistory = await db.getUserWatchHistory(userId);
    res.json({ success: true, data: watchHistory });
  } catch (error) {
    console.error('Get watch history error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve watch history.' });
  }
});

module.exports = router;
