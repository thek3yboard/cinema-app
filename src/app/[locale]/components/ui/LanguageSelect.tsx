import React, { ChangeEventHandler, useContext } from 'react';
import { Select, SelectItem } from '@nextui-org/react';
import { AR, US } from 'country-flag-icons/react/3x2';
import { MediaContext } from '../../(logged)/MediaContext';
import { useTranslations } from 'next-intl';

type Props = {
    handleChangeLanguage: ChangeEventHandler<HTMLSelectElement>,
    smallDevice: boolean
}

export const languageOptions = [
    { key: 'en-US', label: 'English' },
    { key: 'es-AR', label: 'Spanish' }
];

const Flag = ({ children }: { children: React.ReactNode }) => (
    <div className="w-4 h-auto flex-shrink-0">
        {children}
    </div>
);

const renderFlag = (locale: string) => locale === 'en-US' ? <US /> : <AR />;

export default function LanguageSelect({ handleChangeLanguage }: Props) {
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
                return (
                    <span className='flex flex-row gap-2 items-center' key={language.key}>
                        {t(`${language.label}`)}
                        <Flag>{renderFlag(language.key)}</Flag>
                    </span>
                );
            }}
            placeholder={
                <span className='flex flex-row gap-2 items-center' key={language.key}>
                    {t(`${language.label}`)}
                    <Flag>{renderFlag(language.key)}</Flag>
                </span> as any
            }
            className="w-full"
            onChange={handleChangeLanguage}
        >
            {languageOptions.map((option) => (
                <SelectItem key={option.key} textValue={t(`${option.label}`)}>
                    <div className='flex flex-row items-center gap-2'>
                        {t(`${option.label}`)}
                        <Flag>{renderFlag(option.key)}</Flag>
                    </div>
                </SelectItem>
            ))}
        </Select>
    );
}
