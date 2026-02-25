/**
 * Migrates user profile pictures from Imgur URLs (img) to a numeric index (image).
 *
 * The 6 profile pic Imgur URLs map to index 1-6 in order:
 *   1 → https://i.imgur.com/9NYgErPm.png
 *   2 → https://i.imgur.com/Upkz8OFm.png
 *   3 → https://i.imgur.com/29gBEEPm.png
 *   4 → https://i.imgur.com/iigQEaqm.png
 *   5 → https://i.imgur.com/J2pJMGlm.png
 *   6 → https://i.imgur.com/EpKnEsOm.png
 *
 * Usage:
 *   node scripts/migrate-user-images.mjs
 *   node scripts/migrate-user-images.mjs --dry-run
 */

import { MongoClient } from 'mongodb';

const DB_URL = 'mongodb+srv://egsm:Ia3i3rQcdkHF0b5S@cluster0.rwmvi.mongodb.net/unCaged';

const DRY_RUN = process.argv.includes('--dry-run');

// Must match the order of assets/imgs/1.png through 6.png in the client
const IMG_TO_INDEX = new Map([
  ['https://i.imgur.com/9NYgErPm.png', 1],
  ['https://i.imgur.com/Upkz8OFm.png', 2],
  ['https://i.imgur.com/29gBEEPm.png', 3],
  ['https://i.imgur.com/iigQEaqm.png', 4],
  ['https://i.imgur.com/J2pJMGlm.png', 5],
  ['https://i.imgur.com/EpKnEsOm.png', 6],
]);

async function main() {
  if (DRY_RUN) console.log('── DRY RUN — no database writes will occur ──\n');

  console.log('Connecting to MongoDB...');
  const client = new MongoClient(DB_URL);
  await client.connect();

  const users = await client
    .db()
    .collection('users')
    .find({}, { projection: { img: 1 } })
    .toArray();

  console.log(`Found ${users.length} user(s).\n`);

  let matched   = 0;
  let unmatched = 0;
  const bulkOps = [];

  for (const user of users) {
    // Strip size suffix (e.g. "9NYgErPm" → Imgur medium URLs end in 'm')
    // The stored URL may be full-size (no suffix) or medium ('m' suffix).
    // Normalize by checking both variants.
    const rawImg = user.img ?? '';

    // Try exact match first
    let imageIndex = IMG_TO_INDEX.get(rawImg);

    // If not found, try stripping the size letter before the extension
    // e.g. https://i.imgur.com/9NYgErPh.jpg → not in our map, but handle gracefully
    if (imageIndex == null) {
      // Try replacing known size suffixes with 'm' to match what we stored
      const normalized = rawImg.replace(/([a-zA-Z0-9]{7})[a-z](\.\w+)$/, '$1m$2');
      imageIndex = IMG_TO_INDEX.get(normalized);
    }

    if (imageIndex != null) {
      console.log(`  MATCH  user ${user._id} → image ${imageIndex}  (${rawImg})`);
      bulkOps.push({
        updateOne: {
          filter: { _id: user._id },
          update: { $set: { image: imageIndex } },
        },
      });
      matched++;
    } else {
      console.warn(`  NO MATCH  user ${user._id}  img="${rawImg}" → defaulting to 1`);
      bulkOps.push({
        updateOne: {
          filter: { _id: user._id },
          update: { $set: { image: 1 } },
        },
      });
      unmatched++;
    }
  }

  if (!DRY_RUN && bulkOps.length > 0) {
    const result = await client.db().collection('users').bulkWrite(bulkOps);
    console.log(`\nUpdated ${result.modifiedCount} user(s).`);
  } else if (DRY_RUN) {
    console.log(`\n[dry-run] Would update ${bulkOps.length} user(s).`);
  }

  await client.close();
  console.log(`\nDone. ${matched} matched, ${unmatched} defaulted to 1.`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
