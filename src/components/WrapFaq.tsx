import { useState } from 'react';
import { useIntl } from 'react-intl';
import { Accordion, AccordionDetails, AccordionSummary, Box, Chip, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// Chain names and token symbols are technical identifiers and stay untranslated;
// only the `descId` copy is localised.
const NETWORKS = [
  { name: 'Ethereum', native: 'ETH', wrapped: 'WETH', descId: 'network.ethereum.desc' },
  { name: 'Base', native: 'ETH', wrapped: 'WETH', descId: 'network.base.desc' },
  { name: 'HyperEVM', native: 'HYPE', wrapped: 'WHYPE', descId: 'network.hyperevm.desc' },
  { name: 'MegaETH', native: 'ETH', wrapped: 'WETH', descId: 'network.megaeth.desc' },
  { name: 'Arbitrum', native: 'ETH', wrapped: 'WETH', descId: 'network.arbitrum.desc' },
  { name: 'Optimism', native: 'ETH', wrapped: 'WETH', descId: 'network.optimism.desc' },
  { name: 'Polygon', native: 'POL', wrapped: 'WPOL', descId: 'network.polygon.desc' },
  { name: 'Unichain', native: 'ETH', wrapped: 'WETH', descId: 'network.unichain.desc' }
];

function NetworkList() {
  const theme = useTheme();
  const intl = useIntl();
  return (
    <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {NETWORKS.map((n) => (
        <Box
          key={n.name}
          component="li"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 0.25,
            borderLeft: `2px solid ${alpha(theme.palette.primary.main, 0.35)}`,
            pl: 1.5
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography component="span" sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
              {n.name}
            </Typography>
            <Chip
              label={`${n.native} → ${n.wrapped}`}
              size="small"
              sx={{ fontSize: '0.7rem', height: 20, fontFamily: 'monospace' }}
            />
          </Box>
          <Typography sx={{ fontSize: '0.875rem' }} color="text.secondary">
            {intl.formatMessage({ id: n.descId })}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

type FaqItem = {
  /** Translation id of the question. */
  questionId: string;
  /** Translation id of the answer, or a rendered node for non-text answers. */
  answerId?: string;
  answer?: React.ReactNode;
};

type FaqHeadingProps = {
  /** Id of the heading; MUI Accordion uses it as `aria-labelledby` of the answer region. */
  id: string;
  /** Id of the answer region; MUI Accordion reads it off this element's props to id the region. */
  'aria-controls': string;
  children: React.ReactNode;
};

/**
 * Wraps the accordion trigger in a real heading (WAI-ARIA accordion pattern) — a heading
 * placed *inside* the button is dropped from the AX tree, so it has to sit outside it.
 * MUI's Accordion reads `id` / `aria-controls` off its first child's React props to wire
 * up the answer region; `aria-controls` is not a valid attribute on a heading, so it is
 * consumed here and never reaches the DOM. Styling is fully inherited: visually a no-op.
 */
function FaqHeading({ id, children }: FaqHeadingProps) {
  return (
    <Box component="h3" id={id} sx={{ m: 0, font: 'inherit', color: 'inherit' }}>
      {children}
    </Box>
  );
}

const FAQ_ITEMS: FaqItem[] = [
  { questionId: 'faq.q.whatIsWrapping', answerId: 'faq.a.whatIsWrapping' },
  { questionId: 'faq.q.whatIsWeth', answerId: 'faq.a.whatIsWeth' },
  { questionId: 'faq.q.whatIsWpol', answerId: 'faq.a.whatIsWpol' },
  { questionId: 'faq.q.whatIsWhype', answerId: 'faq.a.whatIsWhype' },
  { questionId: 'faq.q.supported', answer: <NetworkList /> },
  { questionId: 'faq.q.fee', answerId: 'faq.a.fee' },
  { questionId: 'faq.q.safety', answerId: 'faq.a.safety' }
];

export function WrapFaq() {
  const theme = useTheme();
  const intl = useIntl();
  const [expanded, setExpanded] = useState<number | false>(false);

  return (
    <Box component="section" aria-labelledby="faq-heading" sx={{ width: '100%', maxWidth: 700, mt: 4 }}>
      <Typography
        id="faq-heading"
        component="h2"
        variant="subtitle2"
        color="text.secondary"
        sx={{ mb: 1.5, textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.7rem' }}
      >
        {intl.formatMessage({ id: 'faq.title' })}
      </Typography>

      {FAQ_ITEMS.map((item, idx) => (
        <Accordion
          key={idx}
          expanded={expanded === idx}
          onChange={(_e, isExpanded) => setExpanded(isExpanded ? idx : false)}
          elevation={0}
          disableGutters
          sx={{
            bgcolor: 'transparent',
            border: 'none',
            borderTop: `1px solid ${alpha(theme.palette.text.primary, 0.07)}`,
            '&:before': { display: 'none' },
            '&:last-child': { borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.07)}` }
          }}
        >
          <FaqHeading id={`faq-question-${idx}`} aria-controls={`faq-answer-${idx}`}>
            <AccordionSummary
              aria-controls={`faq-answer-${idx}`}
              expandIcon={<ExpandMoreIcon sx={{ fontSize: 18, opacity: 0.5 }} />}
              sx={{ px: 0, minHeight: 44, '& .MuiAccordionSummary-content': { my: 0 } }}
            >
              <Typography component="span" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                {intl.formatMessage({ id: item.questionId })}
              </Typography>
            </AccordionSummary>
          </FaqHeading>
          <AccordionDetails sx={{ px: 0, pt: 0, pb: 2 }}>
            {item.answerId ? (
              <Typography sx={{ fontSize: '1rem' }} color="text.secondary">
                {intl.formatMessage({ id: item.answerId })}
              </Typography>
            ) : (
              item.answer
            )}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}
