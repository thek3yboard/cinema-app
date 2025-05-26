"use client";

import { Blocks } from 'react-loader-spinner';

export default function Loading({ top = '50'}) {
    return (
        <div className={`absolute top-[${top}%] left-[50%] translate-y-[-50%] translate-x-[-50%]`}>
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
    )
}