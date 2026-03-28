-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Cached restroom records (merged from OSM + NYC Open Data)
CREATE TABLE IF NOT EXISTS restrooms (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  source        TEXT NOT NULL,
  location      GEOGRAPHY(Point, 4326) NOT NULL,
  accessible    BOOLEAN DEFAULT FALSE,
  hours         TEXT,
  last_verified DATE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS restrooms_location_idx ON restrooms USING GIST (location);

-- Street segment safety scores (computed nightly)
CREATE TABLE IF NOT EXISTS segment_scores (
  id              SERIAL PRIMARY KEY,
  segment_geom    GEOGRAPHY(LineString, 4326) NOT NULL,
  safety_score    NUMERIC(4,3) CHECK (safety_score BETWEEN 0 AND 1),
  incident_count  INTEGER DEFAULT 0,
  lit             BOOLEAN DEFAULT FALSE,
  scored_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS segment_scores_geom_idx ON segment_scores USING GIST (segment_geom);
