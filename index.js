const axios = require('axios');
const fs = require('fs-extra');

const API_URL = 'https://jsonplaceholder.typicode.com/posts';
const FILE_PATH = './data.json';

async function fetchData() {
    try {
        console.log('Fetching data from API...');
        const response = await axios.get(API_URL);
        
        console.log('Saving data to file...');
        await fs.writeJson(FILE_PATH, response.data, { spaces: 2 });
        
        console.log('Data saved successfully!');
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

fetchData();