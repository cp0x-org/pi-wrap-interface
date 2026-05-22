import { useState } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const FAQ_ITEMS = [
  {
    question: 'What is token wrapping?',
    answer:
      'Wrapping converts a native blockchain coin (ETH, POL) into an ERC-20 token (WETH, WPOL). Most DeFi protocols — DEXs, lending platforms, yield farms — only work with ERC-20 tokens. Wrapping lets you use native coins in any ERC-20-compatible protocol at a 1:1 ratio.'
  },
  {
    question: 'What is WETH (Wrapped Ether)?',
    answer:
      'WETH is an ERC-20 token pegged 1:1 to ETH. Deposit ETH into the WETH contract and receive WETH in return. Redeem it back at any time at a 1:1 rate. Used by Uniswap, Aave, Compound, and virtually every major DeFi protocol.'
  },
  {
    question: 'Which networks are supported?',
    answer:
      'Ethereum (ETH ↔ WETH), Base (ETH ↔ WETH), Arbitrum (ETH ↔ WETH), Optimism (ETH ↔ WETH), Polygon (POL ↔ WPOL), and Unichain (ETH ↔ WETH).'
  },
  {
    question: 'Is there a fee?',
    answer:
      'No protocol fee — you receive exactly 1 WETH per 1 ETH wrapped (and vice versa). You only pay the standard network gas fee, which varies by chain and congestion.'
  },
  {
    question: 'Is it safe? Is it non-custodial?',
    answer:
      'Yes. This interface calls the canonical WETH/WPOL smart contracts directly. It is fully permissionless and non-custodial — your funds never leave your wallet until you sign a transaction.'
  }
];

export function WrapFaq() {
  const theme = useTheme();
  const [expanded, setExpanded] = useState<number | false>(false);

  return (
    <Box
      component="section"
      aria-label="Frequently Asked Questions"
      sx={{ width: '100%', maxWidth: 700, mt: 4 }}
    >
      <Typography
        component="h2"
        variant="subtitle2"
        color="text.secondary"
        sx={{ mb: 1.5, textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.7rem' }}
      >
        FAQ
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
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ fontSize: 18, opacity: 0.5 }} />}
            sx={{ px: 0, minHeight: 44, '& .MuiAccordionSummary-content': { my: 0 } }}
          >
            <Typography component="h3" sx={{ fontWeight: 600, fontSize: '1rem' }}>
              {item.question}
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 0, pt: 0, pb: 2 }}>
            <Typography sx={{ fontSize: '1rem' }} color="text.secondary">
              {item.answer}
            </Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}
