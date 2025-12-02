const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.join(__dirname, '..', 'data', 'kitanime.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

async function initializeDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {

      db.run(`CREATE TABLE IF NOT EXISTS api_endpoints (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        url TEXT NOT NULL,
        is_active INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS ad_slots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        position TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('adsense', 'banner')),
        content TEXT NOT NULL,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS admin_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        email TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS bookmarks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        anime_slug TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        UNIQUE (user_id, anime_slug)
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS watch_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        episode_slug TEXT NOT NULL,
        timestamp_seconds REAL NOT NULL DEFAULT 0,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        UNIQUE (user_id, episode_slug)
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS anime_likes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        anime_slug TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        UNIQUE (user_id, anime_slug)
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT NOT NULL UNIQUE,
        value TEXT,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      insertDefaultData()
        .then(() => resolve())
        .catch(reject);
    });
  });
}

async function insertDefaultData() {
  return new Promise((resolve, reject) => {

    db.get("SELECT COUNT(*) as count FROM api_endpoints", (err, row) => {
      if (err) {
        reject(err);
        return;
      }

      if (row.count === 0) {
        db.run(`INSERT INTO api_endpoints (name, url, is_active) VALUES
          ('Default API', 'http://localhost:3000/v1', 1)`);
      }
    });

    db.get("SELECT COUNT(*) as count FROM admin_users", async (err, row) => {
      if (err) {
        reject(err);
        return;
      }

      if (row.count === 0) {
        try {
          const hashedPassword = await bcrypt.hash('admin123', 10);
          db.run(`INSERT INTO admin_users (username, password_hash, email) VALUES
            ('admin', ?, 'admin@kitanime.com')`, [hashedPassword]);
        } catch (error) {
          reject(error);
          return;
        }
      }
    });

    db.get("SELECT COUNT(*) as count FROM ad_slots", (err, row) => {
      if (err) {
        reject(err);
        return;
      }

      if (row.count === 0) {
        db.run(`INSERT INTO ad_slots (name, position, type, content, is_active) VALUES
          ('Header Banner', 'header', 'banner', '<img src="/images/ads/header-banner.jpg" alt="Advertisement" class="w-full h-20 object-cover rounded-lg">', 1),
          ('Sidebar Top', 'sidebar-top', 'adsense', '<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-xxxxxxxxxx" data-ad-slot="xxxxxxxxxx" data-ad-format="auto"></ins>', 1),
          ('Content Bottom', 'content-bottom', 'banner', '<img src="/images/ads/content-banner.jpg" alt="Advertisement" class="w-full h-32 object-cover rounded-lg">', 1)`);
      }
    });

    db.get("SELECT COUNT(*) as count FROM settings", (err, row) => {
      if (err) {
        reject(err);
        return;
      }

      if (row.count === 0) {
        db.run(`INSERT INTO settings (key, value, description) VALUES
          ('site_title', 'KitaNime - Streaming Anime Subtitle Indonesia', 'Judul website'),
          ('site_description', 'Nonton anime subtitle Indonesia terlengkap dan terbaru', 'Deskripsi website'),
          ('cookie_consent_enabled', '1', 'Enable cookie consent popup'),
          ('adsense_enabled', '0', 'Enable Google AdSense')`);
      }

      resolve();
    });
  });
}

const dbHelpers = {

  getActiveApiEndpoint: () => {
    return new Promise((resolve, reject) => {
      db.get("SELECT url FROM api_endpoints WHERE is_active = 1 LIMIT 1", (err, row) => {
        if (err) reject(err);
        else resolve(row ? row.url : null);
      });
    });
  },

  getAllApiEndpoints: () => {
    return new Promise((resolve, reject) => {
      db.all("SELECT * FROM api_endpoints ORDER BY created_at DESC", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  updateApiEndpoint: (id, url, isActive) => {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        if (isActive) {

          db.run("UPDATE api_endpoints SET is_active = 0");
        }

        db.run("UPDATE api_endpoints SET url = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
          [url, isActive ? 1 : 0, id], function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        });
      });
    });
  },

  getAdSlotsByPosition: (position) => {
    return new Promise((resolve, reject) => {
      db.all("SELECT * FROM ad_slots WHERE position = ? AND is_active = 1", [position], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  getAllAdSlots: () => {
    return new Promise((resolve, reject) => {
      db.all("SELECT * FROM ad_slots ORDER BY position, created_at DESC", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  addAdSlot: (name, position, type, content, isActive) => {
    return new Promise((resolve, reject) => {
      db.run("INSERT INTO ad_slots (name, position, type, content, is_active) VALUES (?, ?, ?, ?, ?)",
        [name, position, type, content, isActive ? 1 : 0], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  },

  updateAdSlot: (id, name, position, type, content, isActive) => {
    return new Promise((resolve, reject) => {
      db.run("UPDATE ad_slots SET name = ?, position = ?, type = ?, content = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [name, position, type, content, isActive ? 1 : 0, id], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  },

  deleteAdSlot: (id) => {
    return new Promise((resolve, reject) => {
      db.run("DELETE FROM ad_slots WHERE id = ?", [id], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  },

  getAdminByUsername: (username) => {
    return new Promise((resolve, reject) => {
      db.get("SELECT * FROM admin_users WHERE username = ?", [username], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  getUserByUsernameOrEmail: (identifier) => {
    return new Promise((resolve, reject) => {
      db.get("SELECT * FROM users WHERE username = ? OR email = ?", [identifier, identifier], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  createUser: (username, email, password_hash) => {
    return new Promise((resolve, reject) => {
      db.run("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
        [username, email, password_hash], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  },

  // Bookmarks
  addBookmark: (userId, animeSlug) => {
    return new Promise((resolve, reject) => {
      db.run("INSERT INTO bookmarks (user_id, anime_slug) VALUES (?, ?)",
        [userId, animeSlug], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  },

  removeBookmark: (userId, animeSlug) => {
    return new Promise((resolve, reject) => {
      db.run("DELETE FROM bookmarks WHERE user_id = ? AND anime_slug = ?",
        [userId, animeSlug], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  },

  isBookmarked: (userId, animeSlug) => {
    return new Promise((resolve, reject) => {
      db.get("SELECT 1 FROM bookmarks WHERE user_id = ? AND anime_slug = ?",
        [userId, animeSlug], (err, row) => {
        if (err) reject(err);
        else resolve(!!row);
      });
    });
  },

  getUserBookmarks: (userId) => {
    return new Promise((resolve, reject) => {
      db.all("SELECT anime_slug FROM bookmarks WHERE user_id = ?",
        [userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows.map(row => row.anime_slug));
      });
    });
  },

  // Anime Likes
  addAnimeLike: (userId, animeSlug) => {
    return new Promise((resolve, reject) => {
      db.run("INSERT INTO anime_likes (user_id, anime_slug) VALUES (?, ?)",
        [userId, animeSlug], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  },

  removeAnimeLike: (userId, animeSlug) => {
    return new Promise((resolve, reject) => {
      db.run("DELETE FROM anime_likes WHERE user_id = ? AND anime_slug = ?",
        [userId, animeSlug], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  },

  isAnimeLiked: (userId, animeSlug) => {
    return new Promise((resolve, reject) => {
      db.get("SELECT 1 FROM anime_likes WHERE user_id = ? AND anime_slug = ?",
        [userId, animeSlug], (err, row) => {
        if (err) reject(err);
        else resolve(!!row);
      });
    });
  },

  getUserLikedAnime: (userId) => {
    return new Promise((resolve, reject) => {
      db.all("SELECT anime_slug FROM anime_likes WHERE user_id = ?",
        [userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows.map(row => row.anime_slug));
      });
    });
  },

  // Watch History
  upsertWatchHistory: (userId, episodeSlug, timestampSeconds) => {
    return new Promise((resolve, reject) => {
      db.run(`INSERT INTO watch_history (user_id, episode_slug, timestamp_seconds, updated_at)
              VALUES (?, ?, ?, CURRENT_TIMESTAMP)
              ON CONFLICT(user_id, episode_slug) DO UPDATE SET
                timestamp_seconds = ?,
                updated_at = CURRENT_TIMESTAMP`,
        [userId, episodeSlug, timestampSeconds, timestampSeconds], function(err) {
        if (err) reject(err);
        else resolve(this.lastID || this.changes); // lastID for INSERT, changes for UPDATE
      });
    });
  },

  getWatchHistory: (userId, episodeSlug) => {
    return new Promise((resolve, reject) => {
      db.get("SELECT timestamp_seconds FROM watch_history WHERE user_id = ? AND episode_slug = ?",
        [userId, episodeSlug], (err, row) => {
        if (err) reject(err);
        else resolve(row ? row.timestamp_seconds : 0);
      });
    });
  },

  getUserWatchHistory: (userId) => {
    return new Promise((resolve, reject) => {
      db.all("SELECT episode_slug, timestamp_seconds, updated_at FROM watch_history WHERE user_id = ? ORDER BY updated_at DESC",
        [userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  getSetting: (key) => {
    return new Promise((resolve, reject) => {
      db.get("SELECT value FROM settings WHERE key = ?", [key], (err, row) => {
        if (err) reject(err);
        else resolve(row ? row.value : null);
      });
    });
  },

  updateSetting: (key, value) => {
    return new Promise((resolve, reject) => {
      db.run("UPDATE settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?",
        [value, key], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  }
};

module.exports = {
  db,
  initializeDatabase,
  ...dbHelpers
};
