import cron from 'node-cron';
import axios from 'axios';


cron.schedule('*/14 * * * *', async () => {
  try {
    const response = await axios.get('https://scrumpoker-3qox.onrender.com/ping');
    console.log('Server pinged successfully:', response.data);
  } catch (error) {
    console.error('Error pinging server:', error.message);
  }
});

