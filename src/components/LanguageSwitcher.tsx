import { useIntl } from 'react-intl';

// material-ui
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';

// project imports
import useConfig from 'hooks/useConfig';
import { SUPPORTED_LOCALES } from 'ui-component/Locales';

// types
import { I18n } from 'types/config';

// ==============================|| LANGUAGE SWITCHER ||============================== //

/**
 * Language names are always shown in their own language (endonyms), so they are
 * intentionally not part of the translation files — only the control's accessible
 * name is translated.
 */
const LOCALE_LABELS: Record<I18n, { short: string; full: string }> = {
  en: { short: 'EN', full: 'English' },
  zh: { short: 'ZH', full: '中文' }
};

export default function LanguageSwitcher() {
  const intl = useIntl();
  const { i18n, onChangeLocale } = useConfig();

  const handleChange = (event: SelectChangeEvent) => {
    onChangeLocale(event.target.value as I18n);
  };

  return (
    <FormControl size="small">
      <Select
        value={i18n}
        onChange={handleChange}
        renderValue={(value) => LOCALE_LABELS[value as I18n].short}
        inputProps={{ 'aria-label': intl.formatMessage({ id: 'header.language.aria' }) }}
        sx={{
          fontSize: '0.875rem',
          fontWeight: 500,
          '& .MuiSelect-select': { py: 0.75, pl: 1.25, pr: '28px !important' },
          '& .MuiSelect-icon': { right: 4 }
        }}
      >
        {SUPPORTED_LOCALES.map((locale) => (
          <MenuItem key={locale} value={locale} sx={{ fontSize: '0.875rem' }}>
            {LOCALE_LABELS[locale].full}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
