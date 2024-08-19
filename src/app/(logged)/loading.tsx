"use client";

import { BallTriangle } from 'react-loader-spinner';

export default function Loading() {
    return (
        <div className="absolute top-[50%] left-[50%] translate-y-[-50%] translate-x-[-50%]">
            <BallTriangle
                height={100}
                width={100}
                radius={5}
                color="#e4fde1"
                ariaLabel="ball-triangle-loading"
                wrapperStyle={{}}
                wrapperClass=""
                visible={true}
            />
        </div>
    )
}