import axios from 'axios';

const ACCESS_KEY = 'NoC1jIN5mar-EvH7D96HSixXhhPi7MDM-6feyrZ8nR8';

const unsplashApi = axios.create({
  baseURL: 'https://api.unsplash.com',
  headers: {
    Authorization: `Client-ID ${ACCESS_KEY}`,
  },
});

export const searchPhotos = async (query: string, page: number = 1) => {
  try {
    const response = await unsplashApi.get('/search/photos', {
      params: {
        query,
        page,
		per_page: 1000, 
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error searching photos:', error);
    throw error;
  }
};

export const getPhotoDetails = async (photoId: string) => {
  try {
    const response = await unsplashApi.get(`/photos/${photoId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching photo details:', error);
    throw error;
  }
};
