"use client";

import { Blocks } from 'react-loader-spinner';

export default function Loading({ translateY = '-50', top = '50' }) {
    return (
        <div 
            className="absolute left-1/2 translate-x-[-50%]"
            style={{ top: `${top}%`, transform: `translate(-50%, ${translateY}%)` }}
        >
            <Blocks
                height={100}
                width={100}
                color="#e4fde1"
                ariaLabel="ball-triangle-loading"
                wrapperStyle={{}}
                wrapperClass=""
                visible={true}
            />
        </div>
    );
}