import React, { ChangeEventHandler, useContext } from 'react';
import { Select, SelectItem } from '@nextui-org/react';
import { US, ES, MX } from 'country-flag-icons/react/3x2';
import { MediaContext } from '../../(logged)/MediaContext';
import { useTranslations } from 'next-intl';

type Props = {
    handleChangeLanguage: ChangeEventHandler<HTMLSelectElement>,
    smallDevice: boolean
}

export const languageOptions = [
    { key: 'en-US', label: 'English' },
    { key: 'es-ES', label: 'Spanish' },
    { key: 'es-MX', label: 'Spanish' }
];

const Flag = ({ children }: { children: React.ReactNode }) => (
    <div className="w-4 h-auto flex-shrink-0">
        {children}
    </div>
);

export default function LanguageSelect({ handleChangeLanguage, smallDevice }: Props) {
    const { language } = useContext(MediaContext);
    const t = useTranslations('Language');

    return (
        <Select
            key="language"
            selectedKeys={[language.key]}
            color="default"
            label={t('language')}
            radius="sm"
            renderValue={() => {
                switch(language.key) {
                    case 'en-US':
                        return (
                            <span className='flex flex-row gap-2 items-center' key={language.key}>
                                {t(`${language.label}`)} <Flag><US /></Flag>
                            </span>
                        );
                    case 'es-ES':
                        return (
                            <span className='flex flex-row gap-2 items-center' key={language.key}>
                                {t(`${language.label}`)} <Flag><ES /></Flag>
                            </span>
                        );
                    case 'es-MX':
                        return (
                            <span className='flex flex-row gap-2 items-center' key={language.key}>
                                {t(`${language.label}`)} <Flag><MX /></Flag>
                            </span>
                        );
                    default:
                        return <span key={language.key}>{t(`${language.label}`)}</span>;
                }
            }}
            placeholder={
                <span className='flex flex-row gap-2 items-center' key={language.key}>
                    {t(`${language.label}`)} 
                    {language.key === 'en-US' ? (
                        <Flag><US /></Flag>
                    ) : language.key === 'es-ES' ? (
                        <Flag><ES /></Flag>
                    ) : (
                        <Flag><MX /></Flag>
                    )}
                </span> as any
            }
            className={`${smallDevice === true ? '' : 'max-md:hidden w-60'}`}
            onChange={handleChangeLanguage}
        >
            {languageOptions.map((option) => (
                <SelectItem key={option.key}>
                    <div className='flex flex-row items-center gap-2'>
                        {t(`${option.label}`)} 
                        {option.key === 'en-US' ? (
                            <Flag><US /></Flag>
                        ) : option.key === 'es-ES' ? (
                            <Flag><ES /></Flag>
                        ) : (
                            <Flag><MX /></Flag>
                        )}
                    </div>
                </SelectItem>
            ))}
        </Select>
    );
}