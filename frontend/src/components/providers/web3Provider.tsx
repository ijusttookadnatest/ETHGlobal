"use client"

import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme
} from '@rainbow-me/rainbowkit';
import { WagmiProvider, http } from 'wagmi';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";
import React from 'react';

// Définition de la chain Flow EVM Mainnet
const flowEvmMainnet : any = {
  id: 747,
  name: 'Flow EVM Mainnet',
  network: 'flow-evm-mainnet',
  nativeCurrency: {
    name: 'Flow',
    symbol: 'FLOW',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://mainnet.evm.nodes.onflow.org'] },
    public: { http: ['https://mainnet.evm.nodes.onflow.org'] },
  },
  blockExplorers: {
    default: { name: 'Flowscan', url: 'https://evm.flowscan.io/' },
  },
  testnet: false,
};

export const config = getDefaultConfig({
  appName: 'My Wallet Connect',
  projectId: "6ea86adddd3f285b0710cc3ef5a59737",
  chains: [flowEvmMainnet],
  transports: {
    [flowEvmMainnet.id]: http('https://mainnet.evm.nodes.onflow.org')
  },
  ssr: true,
});

const queryClient = new QueryClient();

export function Web3Provider({ children }: Readonly<{ children: React.ReactNode }>) {

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}  >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
