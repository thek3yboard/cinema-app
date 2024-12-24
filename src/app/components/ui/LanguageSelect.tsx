import React, { ChangeEventHandler, useContext, useState } from 'react';
import { Select, SelectItem } from '@nextui-org/react';
import { MediaContext } from '@/app/(logged)/MediaContext';
import { LanguageType } from '@/types/types';

type Props = {
    handleChangeLanguage: ChangeEventHandler<HTMLSelectElement>,
    smallDevice: boolean
}

export const languageOptions = [
    {
        key: 'en-US', label: 'English'
    },
    {
        key: 'es-ES', label: 'Spanish'
    }
]

export default function LanguageSelect({ handleChangeLanguage, smallDevice }: Props) {
    const { language } = useContext(MediaContext);

    return (
        <Select
            key="language"
            color="default"
            label="Language"
            variant={`${smallDevice === true ? 'bordered' : 'flat'}`}
            radius="sm"
            value={language.label}
            placeholder={language.label}
            className={`${smallDevice === true ? 'bg-blueish-gray rounded-xl' : 'max-md:hidden w-48'}`}
            onChange={handleChangeLanguage}
            selectedKeys={language.key}
        >
            {languageOptions.map((option) => (
            <SelectItem key={option.key}>
                <div className='flex flex-row items-center gap-2'>
                    {option.label}
                </div>
            </SelectItem>
            ))}
        </Select>
    );
};