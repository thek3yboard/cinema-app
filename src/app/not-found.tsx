import React from "react";
import { useTranslations } from 'next-intl';

export default function PageNotFound() {
    const t = useTranslations('PageNotFound');

    return (
        <div className="h-screen flex justify-center items-center overflow-y-auto bg-gradient-to-r from-[#192a49] from-1% via-[#3f577c] via-50% to-[#192a49] to-99%">
            <h1 className="text-white font-bold text-3xl">{t('errorMessage')}</h1>
        </div>
    )
}