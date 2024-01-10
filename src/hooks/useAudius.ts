import { useState, useEffect } from 'react';
import { fetchHosts, fetchStreamUrl } from '../services/audiusApi';

export const useAudius = (trackId: string) => {
  const [currentHostUrl, setCurrentHostUrl] = useState('');
  
  useEffect(() => {
    const determineFastestHost = async () => {
      const hosts = await fetchHosts();
      // Logic to determine the fastest host...
      setCurrentHostUrl(hosts[0]); // Simplified for example purposes
    };

    determineFastestHost();
  }, []);

  const playTrack = async () => {
    if (!currentHostUrl) return '';
    return await fetchStreamUrl(currentHostUrl, trackId);
  };

  return { playTrack };
};
