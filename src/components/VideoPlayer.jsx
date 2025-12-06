import React, { useRef, useEffect, useState } from 'react';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';

const VideoPlayer = ({ src, poster, aspectRatio = 'aspect-[9/16]' }) => {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.6 // Play when 60% visible
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                setIsVisible(entry.isIntersecting);
            });
        }, options);

        if (videoRef.current) {
            observer.observe(videoRef.current);
        }

        return () => {
            if (videoRef.current) {
                observer.unobserve(videoRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (isVisible && videoRef.current) {
            videoRef.current.play().catch(() => { });
            setIsPlaying(true);
        } else if (!isVisible && videoRef.current) {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    }, [isVisible]);

    const togglePlay = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    return (
        <div className={`relative w-full ${aspectRatio} bg-black rounded-2xl overflow-hidden group`}>
            <video
                ref={videoRef}
                src={src}
                poster={poster}
                className="w-full h-full object-cover"
                loop
                muted={isMuted}
                playsInline
            />

            {/* Overlay Controls */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <button
                    onClick={togglePlay}
                    className="p-4 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-all transform hover:scale-110"
                >
                    {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
                </button>
            </div>

            {/* Mute Button */}
            <button
                onClick={toggleMute}
                className="absolute bottom-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors z-10"
            >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
        </div>
    );
};

export default VideoPlayer;
