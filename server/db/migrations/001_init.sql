-- Cached restroom records (merged from OSM + NYC Open Data)
CREATE TABLE IF NOT EXISTS restrooms (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  source        TEXT NOT NULL,
  lat           REAL NOT NULL,
  lng           REAL NOT NULL,
  accessible    INTEGER DEFAULT 0,
  open_now      INTEGER DEFAULT 1,
  hours         TEXT,
  last_verified TEXT,
  created_at    TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_restrooms_lat_lng ON restrooms (lat, lng);

-- Pedestrian demand data (NYC Open Data)
CREATE TABLE IF NOT EXISTS pedestrian_counts (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  lat         REAL NOT NULL,
  lng         REAL NOT NULL,
  street_name TEXT,
  count_am    INTEGER DEFAULT 0,
  count_pm    INTEGER DEFAULT 0,
  borough     TEXT,
  created_at  TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_ped_counts_lat_lng ON pedestrian_counts (lat, lng);

-- Safety data from 311 complaints
CREATE TABLE IF NOT EXISTS safety_data (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  lat             REAL NOT NULL,
  lng             REAL NOT NULL,
  borough         TEXT,
  complaint_type  TEXT,
  descriptor      TEXT,
  incident_date   TEXT,
  time_of_day     TEXT,
  created_at      TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_safety_lat_lng ON safety_data (lat, lng);
CREATE INDEX IF NOT EXISTS idx_safety_time ON safety_data (time_of_day);

-- Street segment safety scores (computed from incident + lighting data)
CREATE TABLE IF NOT EXISTS segment_scores (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  start_lat       REAL NOT NULL,
  start_lng       REAL NOT NULL,
  end_lat         REAL NOT NULL,
  end_lng         REAL NOT NULL,
  safety_score    REAL CHECK (safety_score BETWEEN 0 AND 1),
  incident_count  INTEGER DEFAULT 0,
  lit             INTEGER DEFAULT 0,
  scored_at       TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_segment_lat_lng ON segment_scores (start_lat, start_lng);
