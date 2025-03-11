const express = require('express');
const fs = require('fs-extra');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 8080;

const API_URL = 'https://jsonplaceholder.typicode.com/posts';
const FILE_PATH = './data.json';

async function fetchData() {
    try {
        console.log('Fetching data from API...');
        const response = await axios.get(API_URL);
        
        console.log('Saving data to file...');
        await fs.writeJson(FILE_PATH, response.data, { spaces: 2 });
        
        console.log('Data saved successfully!');
        return true;
    } catch (error) {
        console.error('Error fetching data:', error);
        return false;
    }
}

// Set up routes first
app.get('/', (req, res) => {
  res.send('Node.js app running on Cloud Run!');
});

app.get('/data', async (req, res) => {
  try {
    const data = await fs.readJson(FILE_PATH);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Could not read data file' });
  }
});

// Start the server first, then fetch data
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
  
  // Fetch data after server is running
  fetchData()
    .then(success => {
      console.log('Initial data fetch completed');
    })
    .catch(err => {
      console.error('Failed to fetch initial data:', err);
    });
});