import axios from 'axios';
import getBatch from '../lib/getBatch.js';
import scrapeBatch from '../lib/scrapeBatch.js';

const { BASEURL } = process.env;
const batch = async ({ batchSlug, animeSlug }: {
  batchSlug?: string, animeSlug?: string
}) => {
  let batch: string | undefined = batchSlug;

  if (animeSlug) {
    const response = await axios.get(`${BASEURL}/anime/${animeSlug}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
      }
    });
    const batchData = getBatch(response.data);
    batch = batchData?.slug;
  }
  if (!batch) return false;

  const response = await axios.get(`${BASEURL}/batch/${batch}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
    }
  });
  const result = scrapeBatch(response.data);

  return result;
};

export default batch;
