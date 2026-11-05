import React from 'react';
import { ASSETS } from '@/src/data/Assets';

const HeadGallery = () => {
    return (
        <div className="flex flex-col lg:flex-row lg:items-end justify-center">
            <img
                src={ASSETS.logoRostro2}
                alt="Rostros de la devastacion Logo"
                className="w-full max-w-[260px] sm:max-w-[320px] lg:max-w-[384px] h-auto object-contain"
            />
        </div>
    );
};

export default HeadGallery;
