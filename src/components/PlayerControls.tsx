import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Howl } from 'howler';
import { PlayCircle, PauseCircle } from 'react-feather';
import { fetchStreamUrl } from '../services/audiusApi';

interface Track {
  id: string;
  title: string;
  artwork: {
    '150x150': string;
    '480x480': string;
    '1000x1000': string;
  };
  duration: number;
}

interface PlayerControlsProps {
  trackId: string;
  hostUrl: string;
  currentTrack: Track;
  playNextTrack: () => void;
  playPreviousTrack: () => void;
  isShuffle: boolean;
  toggleShuffle: () => void;
}

const PlayerControls: React.FC<PlayerControlsProps> = ({
  trackId,
  hostUrl,
  currentTrack,
  playNextTrack,
  playPreviousTrack,
  isShuffle,
  toggleShuffle,
}) => {
  const [sound, setSound] = useState<Howl | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const isCurrentlyLoading = useRef(false);

  const loadSound = async () => {
    if (isCurrentlyLoading.current) return; // Check if we are already loading a track
    isCurrentlyLoading.current = true;

    if (sound) {
      sound.unload();
    }

    setIsLoading(true);
    try {
      const streamUrl = await fetchStreamUrl(hostUrl, trackId);
      const newSound = new Howl({
        src: [streamUrl],
        html5: true,
        format: ['mp3'],
        autoplay: true,
      });

      newSound.on('end', playNextTrack);
      setSound(newSound);
    } catch (error) {
      console.error('Error fetching stream URL:', error);
    } finally {
      setIsLoading(false);
      isCurrentlyLoading.current = false; // Reset the loading flag
    }
  };

  useEffect(() => {
    loadSound();
    // Cleanup function
    return () => {
      if (sound) {
        sound.unload();
      }
    };
  }, [trackId, hostUrl]); // Only re-run the effect if trackId or hostUrl changes

  const handlePlayPause = useCallback(() => {
    if (!isLoading && sound) {
      if (sound.playing()) {
        sound.pause();
      } else {
        sound.play();
      }
    }
  }, [isLoading, sound]);

  // Update the progress of the track as it plays
  useEffect(() => {
    if (!sound) return;

    const updateProgress = () => {
      setProgress(sound.seek() as number);
    };

    sound.on('play', () => {
      requestAnimationFrame(updateProgress);
    });

    return () => {
      sound.off('play', updateProgress);
    };
  }, [sound]);

  return (
    <div className="player-controls">
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          {currentTrack.artwork && (
            <img
              src={currentTrack.artwork['480x480']}
              alt={currentTrack.title}
              className="album-artwork"
            />
          )}
          <div className="control-buttons">
            <button onClick={playPreviousTrack} className="player-button">
              Previous
            </button>
            <button onClick={handlePlayPause} className="player-button">
              {sound?.playing() ? <PauseCircle className="icon" /> : <PlayCircle className="icon" />}
            </button>
            <button onClick={playNextTrack} className="player-button">
              Next
            </button>
          </div>
          <div className="volume-and-progress">
            <input
              type="range"
              min="0"
              max={sound?.duration() || 0}
              value={progress}
              onChange={(e) => setProgress(parseFloat(e.target.value))}
              className="progress-bar"
            />
            <button onClick={toggleShuffle} className="player-button">
              {isShuffle ? 'Unshuffle' : 'Shuffle'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default PlayerControls;
