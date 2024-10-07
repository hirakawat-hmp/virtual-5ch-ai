import { getThreadInfo } from './lib/getInfo.js';
import { postToSupabase } from './lib/generatePost.js';

// Retrieve Job-defined env vars
const {CLOUD_RUN_TASK_INDEX = 0, CLOUD_RUN_TASK_ATTEMPT = 0} = process.env;
// Retrieve User-defined env vars
const {SLEEP_MS, FAIL_RATE} = process.env;

// Define main script
const main = async () => {
    console.log(
        `Starting Task #${CLOUD_RUN_TASK_INDEX}, Attempt #${CLOUD_RUN_TASK_ATTEMPT}...`
    );
    const threads = await getThreadInfo();
    const cost = await postToSupabase(threads);
    console.log(`Completed Task #${CLOUD_RUN_TASK_INDEX} with ¥${cost}`);
};

// Start script
main().catch(err => {
    console.error(err);
    process.exit(1); // Retry Job Task by exiting the process
});