import { db } from '../index.js';

export function findRestroomsNear({ lat, lng, radiusMetres, accessible }) {
  let query = `
    SELECT
      id, name, source, lat, lng, accessible, open_now, hours, last_verified,
      haversine(lat, lng, ?, ?) AS distance_metres
    FROM restrooms
    WHERE haversine(lat, lng, ?, ?) <= ?
  `;
  const params = [lat, lng, lat, lng, radiusMetres];

  if (accessible) {
    query += ' AND accessible = 1';
  }

  query += ' ORDER BY distance_metres ASC LIMIT 50';

  return db.prepare(query).all(...params);
}

export function upsertRestroom(restroom) {
  const { id, name, source, lat, lng, accessible, hours, lastVerified } = restroom;
  db.prepare(
    `INSERT INTO restrooms (id, name, source, lat, lng, accessible, hours, last_verified)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT (id) DO UPDATE SET
       name = excluded.name,
       accessible = excluded.accessible,
       hours = excluded.hours,
       last_verified = excluded.last_verified`
  ).run(id, name, source, lat, lng, accessible ? 1 : 0, hours, lastVerified);
}
