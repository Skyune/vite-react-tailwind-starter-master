// /src/App.tsx

import React, { useCallback, useEffect, useState } from 'react';
import PlayerControls from './components/PlayerControls';
import Playlist from './components/Playlist';
import { fetchHosts, fetchPlaylistTracks } from './services/audiusApi';

interface Track {
  id: string;
  title: string;
  artwork: {
    '150x150': string;
    '480x480': string;
    '1000x1000': string;
  };
  user: {
    handle: string;
  };
  duration: number;
  // Add other relevant fields from the model
}



const App: React.FC = () => {
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [currentTrackId, setCurrentTrackId] = useState<string>('');
  const [hostUrl, setHostUrl] = useState<string>('');
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([]);
  const [isShuffle, setIsShuffle] = useState(false);


  const generateShuffledIndices = () => {
    const indices = playlist.map((_, index) => index);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  };

  const toggleShuffle = useCallback(() => {
    setIsShuffle(prevState => !prevState);
    if (!isShuffle) {
      setShuffledIndices(generateShuffledIndices());
    }
  }, [isShuffle, generateShuffledIndices]);
   
  const playNextTrack = () => {
    if (isShuffle && shuffledIndices.length > 0) {
      const currentShuffledIndex = shuffledIndices.findIndex((index) => playlist[index].id === currentTrackId);
      const nextShuffledIndex = (currentShuffledIndex + 1) % shuffledIndices.length;
      setCurrentTrackId(playlist[shuffledIndices[nextShuffledIndex]].id);
    } else {
      const currentIndex = playlist.findIndex((track) => track.id === currentTrackId);
      const nextIndex = (currentIndex + 1) % playlist.length;
      setCurrentTrackId(playlist[nextIndex].id);
    }
  };
  
  

  const playPreviousTrack = () => {
    const currentIndex = playlist.findIndex(track => track.id === currentTrackId);
    const previousIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    setCurrentTrackId(playlist[previousIndex].id);
  };
  const currentTrack = playlist.find(track => track.id === currentTrackId);

  useEffect(() => {
    let isCancelled = false;
  
    const getHostsAndTracks = async () => {
      const hosts = await fetchHosts();
      if (isCancelled) return;
      
      if (hosts.length > 0) {
        const fastestHost = hosts[0];
        setHostUrl(fastestHost);
        const tracks = await fetchPlaylistTracks('DOPRl', fastestHost);
        if (isCancelled) return;
        setPlaylist(tracks);
  
        // Set the current track ID here to avoid null at initial render
        if (tracks.length > 0) {
          const randomIndex = Math.floor(Math.random() * tracks.length);
          setCurrentTrackId(tracks[randomIndex].id);
        }
      }
    };
  
    getHostsAndTracks();
  
    // Cleanup function to avoid setting state if the component unmounts
    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <div className="flex h-screen bg-gray-200">
      <div className="flex-grow p-8">
        <h1 className="text-4xl font-bold mb-8">Audius Player</h1>
        {hostUrl && currentTrack && (
          <PlayerControls
            trackId={currentTrackId}
            hostUrl={hostUrl}
            currentTrack={currentTrack}
            playNextTrack={playNextTrack}
            playPreviousTrack={playPreviousTrack}
            isShuffle={isShuffle}
            toggleShuffle={toggleShuffle}
          />
        )}
      </div>
      <Playlist
        playlist={playlist}
        onSelectTrack={setCurrentTrackId}
        currentTrackId={currentTrackId}
      />
    </div>
  );
};

export default App;
