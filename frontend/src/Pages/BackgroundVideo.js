import React from 'react';

const BackgroundVideo = () => {
   return (
      <div className="absolute inset-0 overflow-hidden z-[-1]">
         <video className="min-w-full min-h-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" autoPlay loop muted playsInline>
            <source src="https://facia.ai/wp-content/uploads/2024/03/facia-banner-video.mp4" type="video/mp4" />
         </video>
      </div>
   );
};

export default BackgroundVideo;
