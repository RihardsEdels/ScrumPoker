import cron from 'cron';
import https from 'https';

const backendUrl = 'scrumpoker-3qox.onrender.com';

// Create cron job to hit endpoint every 14 minutes
const job = new cron.CronJob('*/14 * * * *', function () {
    console.log('Restarting server');

    // Perform an HTTPS GET request to hit any backend api
    https
        .get(`https://${backendUrl}`, (res) => {
            if (res.statusCode === 200) {
                console.log('Server was restarted');
            } else {
                console.error(
                    `Failed to restart server with status code: ${res.statusCode}`
                );
            }
        })
        .on('error', (err) => {
            console.error('Error during Restart:', err.message);
        });
});

// Export the cron job
export { job };
