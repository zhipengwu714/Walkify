const API_KEY = process.env.BESTTIME_API_KEY;
const BASE_URL = 'https://besttime.app/api/v1';

// Returns crowd density cells for a bounding area.
// Returns empty array until API key is configured.
export async function getVenueBusyness({ lat, lng, radius }) {
  if (!API_KEY) {
    console.warn('BESTTIME_API_KEY not set — returning empty crowd data');
    return [];
  }

  // TODO: implement BestTime.app venue search + busyness fetch
  return [];
}
