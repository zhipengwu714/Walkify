import { db } from '../db/index.js';

// NYC Open Data: Pedestrian Mobility Plan - Pedestrian Demand
const NYC_PED_DEMAND_URL =
  'https://data.cityofnewyork.us/resource/fwpa-qxaf.json?$limit=5000&$select=street,boroname,category,rank,the_geom';

export async function seedPedestrianCounts() {
  console.log('Fetching pedestrian demand data from NYC Open Data...');

  const response = await fetch(NYC_PED_DEMAND_URL);
  if (!response.ok) throw new Error(`NYC API error: ${response.status}`);

  const data = await response.json();
  console.log(`Fetched ${data.length} pedestrian demand records`);

  db.exec('DELETE FROM pedestrian_counts');

  const insert = db.prepare(
    `INSERT INTO pedestrian_counts (lat, lng, street_name, count_am, count_pm, borough)
     VALUES (?, ?, ?, ?, ?, ?)`
  );

  const insertMany = db.transaction((items) => {
    let inserted = 0;
    for (const p of items) {
      if (!p.the_geom?.coordinates?.[0]?.[0]) continue;

      // Use midpoint of the line segment
      const coords = p.the_geom.coordinates[0];
      const midIdx = Math.floor(coords.length / 2);
      const lng = coords[midIdx][0];
      const lat = coords[midIdx][1];

      if (isNaN(lat) || isNaN(lng)) continue;

      // Rank is 1-10, scale to approximate pedestrian counts
      const rank = parseInt(p.rank) || 1;
      const baseCount = rank * 150;
      const amCount = Math.round(baseCount * 0.7);
      const pmCount = baseCount;

      insert.run(lat, lng, p.street || null, amCount, pmCount, p.boroname || null);
      inserted++;
    }
    return inserted;
  });

  const count = insertMany(data);
  console.log(`Inserted ${count} pedestrian demand records`);
}
