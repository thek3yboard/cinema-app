import React, { ChangeEventHandler, useContext } from 'react';
import { Select, SelectItem } from '@nextui-org/react';
import { US, ES, MX } from 'country-flag-icons/react/3x2'
import { MediaContext } from '../../(logged)/MediaContext';
import { useTranslations } from 'next-intl';

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
    },
    {
        key: 'es-MX', label: 'Spanish'
    }
]

export default function LanguageSelect({ handleChangeLanguage, smallDevice }: Props) {
    const { language } = useContext(MediaContext);
    const t = useTranslations('Language');

    return (
        <Select
            key="language"
            color="default"
            label={t('language')}
            radius="sm"
            renderValue={() => {
                switch(language.key) {
                    case 'en-US':
                        return <span className='flex flex-row gap-2' key={language.key}>{t(`${language.label}`)} <US className='w-4' /></span>
                    case 'es-ES':
                        return <span className='flex flex-row gap-2' key={language.key}>{t(`${language.label}`)} <ES className='w-4' /></span>
                    case 'es-MX':
                        return <span className='flex flex-row gap-2' key={language.key}>{t(`${language.label}`)} <MX className='w-4' /></span>
                    default:
                        return <span key={language.key}>{t(`${language.label}`)}</span>
                }
            }}
            placeholder={
                <span className='flex flex-row gap-2' key={language.key}>{t(`${language.label}`)} 
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
                    {t(`${option.label}`)} {option.key === 'en-US' ? 
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