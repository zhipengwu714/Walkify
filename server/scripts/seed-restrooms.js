import { db } from '../db/index.js';

// NYC Open Data: Public Restrooms (with coordinates)
const NYC_RESTROOMS_URL =
  'https://data.cityofnewyork.us/resource/i7jb-7jku.json?$limit=2000';

export async function seedRestrooms() {
  console.log('Fetching restrooms from NYC Open Data...');

  const response = await fetch(NYC_RESTROOMS_URL);
  if (!response.ok) throw new Error(`NYC API error: ${response.status}`);

  const data = await response.json();
  console.log(`Fetched ${data.length} restrooms`);

  db.exec('DELETE FROM restrooms');

  const insert = db.prepare(
    `INSERT INTO restrooms (id, name, source, lat, lng, accessible, open_now, hours)
     VALUES (?, ?, 'nyc-open-data', ?, ?, ?, ?, ?)`
  );

  const insertMany = db.transaction((items) => {
    let inserted = 0;
    for (const r of items) {
      const lat = Number(r.latitude);
      const lng = Number(r.longitude);
      if (!lat || !lng) continue;

      const id = `nyc-${inserted}-${r.facility_name?.replace(/\s+/g, '-').toLowerCase() ?? 'restroom'}`;
      const isAccessible =
        r.accessibility === 'Fully Accessible' || r.accessibility === 'Partially Accessible' ? 1 : 0;
      const isOpen = r.status === 'Operational' ? 1 : 0;

      insert.run(
        id,
        r.facility_name || 'Public Restroom',
        lat,
        lng,
        isAccessible,
        isOpen,
        r.restroom_type || 'Unknown',
      );
      inserted++;
    }
    return inserted;
  });

  const count = insertMany(data);
  console.log(`Inserted ${count} restrooms`);
}
