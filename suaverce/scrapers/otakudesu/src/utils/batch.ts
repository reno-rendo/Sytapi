import getBatch from '../lib/getBatch.js';
import scrapeBatch from '../lib/scrapeBatch.js';
import { getPageContent } from './puppeteerHelper.js';

const { BASEURL } = process.env;
const batch = async ({ batchSlug, animeSlug }: {
  batchSlug?: string, animeSlug?: string
}) => {
  let batch: string | undefined = batchSlug;

  if (animeSlug) {
    const data = await getPageContent(`${BASEURL}/anime/${animeSlug}`);
    const batchData = getBatch(data);
    batch = batchData?.slug;
  }
  if (!batch) return false;

  const data = await getPageContent(`${BASEURL}/batch/${batch}`);
  const result = scrapeBatch(data);

  return result;
};

export default batch;
