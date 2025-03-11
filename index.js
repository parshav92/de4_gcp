const express = require('express');
const axios = require('axios');
const { Storage } = require('@google-cloud/storage');
const app = express();
const port = process.env.PORT || 8080;

const storage = new Storage();
const BUCKET_NAME = process.env.BUCKET_NAME || 'de4'; 
const FILE_NAME = 'data.json';
const API_URL = 'https://jsonplaceholder.typicode.com/posts';

async function fetchAndStoreData() {
  try {
    console.log('Fetching data from API...');
    const response = await axios.get(API_URL);
    
    console.log(`Saving data to GCS bucket: ${BUCKET_NAME}`);
    const bucket = storage.bucket(BUCKET_NAME);
    const file = bucket.file(FILE_NAME);
    
    await file.save(JSON.stringify(response.data, null, 2), {
      contentType: 'application/json',
      metadata: {
        cacheControl: 'public, max-age=3600',
      }
    });
    
    console.log('Data saved successfully to GCS!');
    return true;
  } catch (error) {
    console.error('Error fetching or storing data:', error);
    return false;
  }
}

// Get data from GCS bucket
async function getDataFromBucket() {
  try {
    const bucket = storage.bucket(BUCKET_NAME);
    const file = bucket.file(FILE_NAME);
    
    // Check if file exists
    const [exists] = await file.exists();
    if (!exists) {
      return null;
    }
    
    // Download and parse the file
    const [content] = await file.download();
    return JSON.parse(content.toString());
  } catch (error) {
    console.error('Error retrieving data from GCS:', error);
    return null;
  }
}

// Set up routes
app.get('/', (req, res) => {
  res.send('Node.js app running on Cloud Run with GCS storage!');
});

app.get('/data', async (req, res) => {
  try {
    const data = await getDataFromBucket();
    if (data) {
      res.json(data);
    } else {
      res.status(404).json({ error: 'Data not found in bucket' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Could not retrieve data from bucket' });
  }
});

app.get('/refresh', async (req, res) => {
  try {
    const success = await fetchAndStoreData();
    if (success) {
      res.json({ message: 'Data refreshed successfully' });
    } else {
      res.status(500).json({ error: 'Failed to refresh data' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error during data refresh' });
  }
});

// Start the server first, then fetch data
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
  
  // Fetch data after server is running
  fetchAndStoreData()
    .then(success => {
      console.log('Initial data fetch completed');
    })
    .catch(err => {
      console.error('Failed to fetch initial data:', err);
    });
});