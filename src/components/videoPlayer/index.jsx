import React, { useState } from 'react';
import ReactPlayer from 'react-player';

const VideoPlayer = ({ videoSources }) => {
    const [currentQuality, setCurrentQuality] = useState(videoSources[0]);

    const handleQualityChange = (quality) => {
        const selectedSource = videoSources.find(src => src.quality === quality);
        setCurrentQuality(selectedSource);
    };

    return (
        <div>
            <ReactPlayer
                url={currentQuality.url}
                controls
                width="100%"
                height="auto"
            />
            <div>
                {videoSources.map((source) => (
                    <button
                        key={source.quality}
                        onClick={() => handleQualityChange(source.quality)}
                        style={{ margin: '5px' }}
                    >
                        {source.quality}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default VideoPlayer;
