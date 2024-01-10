import axios from 'axios';

const API_BASE_URL = 'https://api.audius.co/';

export const fetchHosts = async (): Promise<string[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching hosts:', error);
    return [];
  }
};

export const fetchStreamUrl = async (hostUrl: string, trackId: string): Promise<string> => {
    try {
     const response = await axios.get(`${hostUrl}/v1/tracks/${trackId}/stream?app_name=YOUR_APP_NAME`, { responseType: 'blob' });
     if (response.status !== 200) {
       throw new Error('Failed to fetch stream URL');
     }
     const blob = new Blob([response.data], { type: 'audio/mpeg' });
     return URL.createObjectURL(blob);
    } catch (error) {
     console.error('Error fetching stream URL:', error);
     throw error;
    }
   };
   
   export const fetchPlaylistTracks = async (playlistId: string, hostUrl: string): Promise<any[]> => {
    try {
      const response = await axios.get(`${hostUrl}/v1/playlists/${playlistId}/tracks?app_name=YOUR_APP_NAME`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching playlist tracks:', error);
      return [];
    }
  };


export const getFastestHost = async (): Promise<string> => {
    const hosts = await fetchHosts();
    let fastestHost = '';
    let fastestTime = Number.MAX_VALUE;
  
    for (const host of hosts) {
      const start = performance.now();
      await axios.get(`${host}/health_check`).catch(() => {});
      const latency = performance.now() - start;
      if (latency < fastestTime) {
        fastestTime = latency;
        fastestHost = host;
      }
    }
  
    return fastestHost;
  };