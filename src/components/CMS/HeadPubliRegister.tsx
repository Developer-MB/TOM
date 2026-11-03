import React from 'react';

interface HeadPubliRegisterProps {
    count: number;
}

const HeadPubliRegister: React.FC<HeadPubliRegisterProps> = ({ count }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-5 border-b border-zinc-800">
        <div>
            <h2 className="font-display font-black text-2xl uppercase text-white">
                COLA EDITORIAL ACTIVA ({count})
            </h2>
        </div>

    </div>
);

export default HeadPubliRegister;
