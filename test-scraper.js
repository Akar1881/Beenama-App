// test-scraper.js
import { getStreams } from './scraper/vidlink.js';

// CHANGE THESE TO TEST
const TMDB_ID = 414906; // Example: The Batman
const MEDIA_TYPE = 'movie'; // 'movie' or 'tv'
const SEASON = null; // e.g. 1
const EPISODE = null; // e.g. 1

async function runTest() {
    console.log('=== Vidlink Test Scraper ===');

    try {
        const result = await getStreams(
            TMDB_ID,
            MEDIA_TYPE,
            SEASON,
            EPISODE
        );

        console.log('\n--- STREAMS ---');
        result.streams.forEach((s, i) => {
            console.log(`${i + 1}. ${s.name}`);
            console.log(`   Quality: ${s.quality}`);
            console.log(`   URL: ${s.url}`);
            console.log(`   Provider: ${s.provider}`);
            console.log('');
        });

        console.log('--- SUBTITLES ---');
        result.subtitles.forEach((sub, i) => {
            console.log(`${i + 1}. ${sub.label} (${sub.language})`);
            console.log(`   URL: ${sub.url}`);
        });

        console.log(`\nTotal Streams: ${result.streams.length}`);
        console.log(`Total Subtitles: ${result.subtitles.length}`);
    } catch (err) {
        console.error('Test failed:', err);
    }
}

runTest();