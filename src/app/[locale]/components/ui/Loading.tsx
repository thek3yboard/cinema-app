"use client";

import { Blocks } from "react-loader-spinner";

export default function Loading() {
    return (
        <div className="fixed top-0 left-0 w-screen h-screen flex items-center justify-center z-[9999] bg-transparent">
            <Blocks
                height={100}
                width={100}
                color="#e4fde1"
                ariaLabel="blocks-loading"
                visible={true}
            />
        </div>
    );
}
