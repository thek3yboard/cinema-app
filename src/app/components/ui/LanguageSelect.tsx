import React, { ChangeEventHandler, useContext } from 'react';
import { Select, SelectItem } from '@nextui-org/react';
import { US, ES, MX } from 'country-flag-icons/react/3x2'
import { MediaContext } from '@/app/(logged)/MediaContext';

type Props = {
    handleChangeLanguage: ChangeEventHandler<HTMLSelectElement>,
    smallDevice: boolean
}

export const languageOptions = [
    {
        key: 'en-US', label: 'English'
    },
    {
        key: 'es-ES', label: 'Español'
    },
    {
        key: 'es-MX', label: 'Español'
    }
]

export default function LanguageSelect({ handleChangeLanguage, smallDevice }: Props) {
    const { language } = useContext(MediaContext);

    return (
        <Select
            key="language"
            color="default"
            label="Language"
            radius="sm"
            renderValue={() => {
                switch(language.key) {
                    case 'en-US':
                        return <span className='flex flex-row gap-2' key={language.key}>{language.label} <US className='w-4' /></span>
                    case 'es-ES':
                        return <span className='flex flex-row gap-2' key={language.key}>{language.label} <ES className='w-4' /></span>
                    case 'es-MX':
                        return <span className='flex flex-row gap-2' key={language.key}>{language.label} <MX className='w-4' /></span>
                    default:
                        return <span key={language.key}>{language.label}</span>
                }
            }}
            placeholder={
                <span className='flex flex-row gap-2' key={language.key}>{language.label} 
                    { language.key === 'en-US' ?
                        <US className='w-4' />
                    : language.key === 'es-ES' ?
                        <ES className='w-4' />
                    :
                        <MX className='w-4' />
                    }
                </span> as any
            }
            className={`${smallDevice === true ? '' : 'max-md:hidden w-48'}`}
            onChange={handleChangeLanguage}
        >
            {languageOptions.map((option) => (
            <SelectItem key={option.key}>
                <div className='flex flex-row items-center gap-2'>
                    {option.label} {option.key === 'en-US' ? 
                            <US className='w-4' /> 
                        : option.key === 'es-ES' ?
                            <ES className='w-4' />
                        :
                            <MX className='w-4' />
                        }
                </div>
            </SelectItem>
            ))}
        </Select>
    );
};