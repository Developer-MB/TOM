import React from 'react'
import { ASSETS } from '@/src/data/Assets'

const HeadGallery = () => {
    return (
        <div className="flex flex-col lg:flex-row lg:items-end justify-center">
            <img src={ASSETS.logoRostro}
                alt="Rostros de la devastacion Logo"
                className="w-100 sm:w-64 lg:w-96"
            />
        </div>
    )
}

export default HeadGallery