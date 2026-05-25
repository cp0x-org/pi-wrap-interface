import { useState } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Box, Chip, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const NETWORKS = [
  {
    name: 'Ethereum',
    native: 'ETH',
    wrapped: 'WETH',
    desc: 'The original smart contract platform and DeFi hub. WETH is the standard ERC-20 used across all major protocols.'
  },
  {
    name: 'Base',
    native: 'ETH',
    wrapped: 'WETH',
    desc: "Coinbase's OP Stack L2 — low fees, fast finality, growing DeFi ecosystem."
  },
  {
    name: 'HyperEVM',
    native: 'HYPE',
    wrapped: 'WHYPE',
    desc: "Hyperliquid's EVM environment. HYPE is the native token; WHYPE makes it composable with ERC-20 DeFi."
  },
  {
    name: 'MegaETH',
    native: 'ETH',
    wrapped: 'WETH',
    desc: 'Ultra-high-throughput EVM L2 targeting 100k+ TPS for real-time on-chain applications.'
  },
  {
    name: 'Arbitrum',
    native: 'ETH',
    wrapped: 'WETH',
    desc: 'Leading Ethereum L2 with Nitro rollup technology. Home to Uniswap, GMX, and hundreds of DeFi protocols.'
  },
  {
    name: 'Optimism',
    native: 'ETH',
    wrapped: 'WETH',
    desc: 'OP Stack L2 with EVM equivalence. Powers Velodrome, Synthetix, and the Superchain ecosystem.'
  },
  {
    name: 'Polygon',
    native: 'POL',
    wrapped: 'WPOL',
    desc: 'High-throughput EVM sidechain. POL is the native gas token; WPOL unlocks it for ERC-20 DeFi use.'
  },
  {
    name: 'Unichain',
    native: 'ETH',
    wrapped: 'WETH',
    desc: "Uniswap Labs' own OP Stack L2, optimized for on-chain trading and liquidity."
  },
];

function NetworkList() {
  const theme = useTheme();
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
            {n.desc}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

type FaqItem = {
  question: string;
  answer: string | React.ReactNode;
};

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'What is token wrapping?',
    answer:
      'Wrapping converts a native blockchain coin (ETH, POL, HYPE) into an ERC-20 token (WETH, WPOL, WHYPE). Most DeFi protocols — DEXs, lending platforms, yield farms — only work with ERC-20 tokens. Wrapping lets you use native coins in any ERC-20-compatible protocol at a 1:1 ratio with no fee and no counterparty risk.'
  },
  {
    question: 'What is WETH (Wrapped Ether)?',
    answer:
      'WETH is an ERC-20 token pegged 1:1 to ETH. Deposit ETH into the WETH contract and receive WETH in return; redeem it back at any time at the same 1:1 rate. WETH is supported on Ethereum, Base, Arbitrum, Optimism, Unichain, and MegaETH — wherever ETH is the native gas token.'
  },
  {
    question: 'What is WPOL (Wrapped POL)?',
    answer:
      'WPOL is the ERC-20 version of POL, the native gas token of the Polygon network. Wrapping POL into WPOL lets you use it in Polygon DeFi protocols such as QuickSwap, Aave, and Balancer that require ERC-20 tokens. Unwrap back to POL at any time at 1:1.'
  },
  {
    question: 'What is WHYPE (Wrapped HYPE)?',
    answer:
      'WHYPE is the ERC-20 version of HYPE, the native token of Hyperliquid\'s HyperEVM chain. Wrapping HYPE into WHYPE makes it composable with EVM DeFi protocols that require the ERC-20 standard. Unwrap back to HYPE at any time at 1:1.'
  },
  {
    question: 'Which networks and tokens are supported?',
    answer: <NetworkList />
  },
  {
    question: 'Is there a fee?',
    answer:
      'No protocol fee — you receive exactly 1 wrapped token per 1 native coin (and vice versa). You only pay the standard network gas fee, which varies by chain and congestion.'
  },
  {
    question: 'Is it safe? Is it non-custodial?',
    answer:
      'Yes. This interface calls the canonical WETH / WPOL / WHYPE smart contracts directly. It is fully permissionless and non-custodial — your funds never leave your wallet until you sign a transaction. No approvals, no intermediaries.'
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
            {typeof item.answer === 'string' ? (
              <Typography sx={{ fontSize: '1rem' }} color="text.secondary">
                {item.answer}
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
