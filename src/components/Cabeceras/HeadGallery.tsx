import React from 'react'

const HeadGallery = () => {
    return (
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-zinc-800/80">
            <div>
                <h1 className="font-display font-black text-2xl sm:text-4xl lg:text-5xl uppercase tracking-tight leading-[0.92] text-white">
                    CRÓNICAS DE{' '}
                    <span className="text-[#DC2626]">FUEGO Y SANGRE</span>
                </h1>
                <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mt-3 leading-relaxed">
                    Fotografía documental en alta resolución capturada sin flash desde la primera línea de fuego. El sudor, la pirotecnia y la catarsis ritual de los escenarios más extremos del planeta.
                </p>
            </div>
        </div>
    )
}

export default HeadGallery