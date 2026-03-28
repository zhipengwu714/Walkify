import { db } from '../db/index.js';

// NYC Open Data: 311 Service Requests (safety-related complaints)
const NYC_311_URL =
  "https://data.cityofnewyork.us/resource/erm2-nwe9.json?" +
  "$limit=5000&" +
  "$where=latitude IS NOT NULL AND (" +
  "complaint_type='Noise - Street/Sidewalk' OR " +
  "complaint_type='Street Light Condition' OR " +
  "complaint_type='Illegal Parking' OR " +
  "complaint_type='Blocked Driveway' OR " +
  "complaint_type='Drug Activity' OR " +
  "complaint_type='Drinking' OR " +
  "complaint_type='Panhandling' OR " +
  "complaint_type='Homeless Person Assistance' OR " +
  "complaint_type='Graffiti' OR " +
  "complaint_type='Damaged Tree'" +
  ")&$order=created_date DESC";

export async function seedSafetyData() {
  console.log('Fetching 311 safety data from NYC Open Data...');

  const response = await fetch(NYC_311_URL);
  if (!response.ok) throw new Error(`NYC API error: ${response.status}`);

  const data = await response.json();
  console.log(`Fetched ${data.length} safety records`);

  db.exec('DELETE FROM safety_data');

  const insert = db.prepare(
    `INSERT INTO safety_data (lat, lng, borough, complaint_type, descriptor, incident_date, time_of_day)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  );

  const insertMany = db.transaction((items) => {
    let inserted = 0;
    for (const s of items) {
      const lat = parseFloat(s.latitude);
      const lng = parseFloat(s.longitude);
      if (isNaN(lat) || isNaN(lng)) continue;

      let timeOfDay = 'day';
      if (s.created_date) {
        const hour = new Date(s.created_date).getHours();
        timeOfDay = hour >= 20 || hour < 6 ? 'night' : 'day';
      }

      insert.run(lat, lng, s.borough || null, s.complaint_type || null, s.descriptor || null, s.created_date || null, timeOfDay);
      inserted++;
    }
    return inserted;
  });

  const count = insertMany(data);
  console.log(`Inserted ${count} safety records`);
}
