import { pool } from '../index.js';

export async function findRestroomsNear({ lat, lng, radiusMetres, accessible, openNow }) {
  let query = `
    SELECT
      id, name, source, accessible, hours, last_verified,
      ST_Distance(location, ST_MakePoint($2, $1)::geography) AS distance_metres
    FROM restrooms
    WHERE ST_DWithin(location, ST_MakePoint($2, $1)::geography, $3)
  `;
  const params = [lat, lng, radiusMetres];

  if (accessible) {
    query += ` AND accessible = TRUE`;
  }

  query += ` ORDER BY distance_metres ASC LIMIT 50`;

  const { rows } = await pool.query(query, params);
  return rows;
}

export async function upsertRestroom(restroom) {
  const { id, name, source, lat, lng, accessible, hours, lastVerified } = restroom;
  await pool.query(
    `INSERT INTO restrooms (id, name, source, location, accessible, hours, last_verified)
     VALUES ($1, $2, $3, ST_MakePoint($5, $4)::geography, $6, $7, $8)
     ON CONFLICT (id) DO UPDATE SET
       name = EXCLUDED.name,
       accessible = EXCLUDED.accessible,
       hours = EXCLUDED.hours,
       last_verified = EXCLUDED.last_verified`,
    [id, name, source, lat, lng, accessible, hours, lastVerified]
  );
}
