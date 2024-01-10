// /src/components/Playlist.tsx

import React from 'react';

interface PlaylistProps {
  playlist: any[]; // Replace `any` with your track type
  onSelectTrack: (trackId: string) => void;
  currentTrackId: string;
}

const Playlist: React.FC<PlaylistProps> = ({ playlist, onSelectTrack, currentTrackId }) => {
    return (
      <div className="w-1/4 h-full overflow-auto bg-gray-100 p-4">
        <h3 className="text-lg font-semibold mb-4">Playlist</h3>
        {playlist.map((track) => (
          <div
            key={track.id}
            className={`p-2 my-2 cursor-pointer ${track.id === currentTrackId ? 'bg-blue-500 text-white' : 'hover:bg-blue-100'}`}
            onClick={() => onSelectTrack(track.id)}
          >
            {track.title}
          </div>
        ))}
      </div>
    );
  };
  

export default Playlist;
