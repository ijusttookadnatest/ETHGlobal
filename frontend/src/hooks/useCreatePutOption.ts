"use client";
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { optionManagerABI, erc20ABI, OPTION_MANAGER_ADDRESS, USDC_ADDRESS } from '@/lib/web3';
import { useState } from 'react';
import { writeContract } from 'wagmi/actions';
import { useSequentialTransactions } from './useSequentialTx';


export function useBlockchainCreatePutOption() {
  const { executeSequence, isLoading, isComplete, error } = useSequentialTransactions();

  const createOption = async ({
    strike_price,
    premiumPrice,
    expiry,
    asset,
    amount
  }: {
    strike_price: string,
    premiumPrice: string,
    expiry: Date,
    asset: string,
    amount: string
  }) => {
    const transactions = [
      // 1. Approve USDC
      {
        address: USDC_ADDRESS,
        abi: erc20ABI,
        functionName: 'approve',
        args: [OPTION_MANAGER_ADDRESS, BigInt(strike_price)],
      },
      // 2. Create option
      {
        address: OPTION_MANAGER_ADDRESS,
        abi: optionManagerABI,
        functionName: 'createPutOpt',
        args: [
          BigInt(strike_price),
          BigInt(premiumPrice),
          BigInt(Math.floor(expiry.getTime() / 1000)),
          asset as `0x${string}`,
          BigInt(amount),
        ],
      }
    ];

    executeSequence(transactions);
  };

  return {
    createOption,
    isLoading,
    isSuccess: isComplete,
    error
  };
}

// Custom hook for creating a put option in the database
export function useDatabaseCreatePutOption() {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const pushPutOptionInDatabase = async ({
    id_blockchain,
    strike_price,
    premiumPrice,
    expiry,
    asset,
    amount
  }: {
    id_blockchain: string,
    strike_price: string,
    premiumPrice: string,
    expiry: Date | null,
    asset: string,
    amount: string
  }) => {
    try {
      setIsLoading(true);
      setError(null);

      if (!id_blockchain || !strike_price || !premiumPrice || !expiry || !asset || !amount) {
        console.error("Missing required fields:", {
          id_blockchain, strike_price, premiumPrice, expiry, asset, amount
        });
        throw new Error("One or more required fields are missing.");
      }

      const response = await fetch('/api/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_blockchain: id_blockchain,
          strike_price: strike_price,
          premium_price: premiumPrice,
          expiry: expiry.toISOString(),
          asset,
          amount,
          seller_address: address,
        })
      });

      if (!response.ok) {
        throw new Error("Failed to create option.");
      }

      const result = await response.json();
      console.log('Option created successfully.');
      return result;
    } catch (err) {
      setError(err as Error);
      console.error('Error creating option:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    pushPutOptionInDatabase,
    isLoading,
    error
  };
}
