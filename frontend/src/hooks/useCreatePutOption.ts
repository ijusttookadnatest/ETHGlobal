"use client";
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { optionManagerABI, erc20ABI, OPTION_MANAGER_ADDRESS, USDC_ADDRESS } from '@/lib/web3';
import { useState } from 'react';
import { writeContract } from 'wagmi/actions';

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Custom hook for creating a put option on the blockchain
export function useBlockchainCreatePutOption() {
  const { writeContract, data: hash, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

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
    try {
      // First approve USDC spending
      await writeContract({
        address: USDC_ADDRESS,
        abi: erc20ABI,
        functionName: 'approve',
        args: [OPTION_MANAGER_ADDRESS, BigInt(strike_price)],
      });

      console.log('Approve transaction successful');
      await sleep(20000); 
      // 3. Quand c'est confirmé, lance la création de l'option
      await writeContract({
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
      });

      return true;
    } catch (err) {
      console.error('Error creating option:', err);
      return false;
    }
  };

  return {
    createOption,
    isLoading: isConfirming,
    isSuccess: isConfirmed,
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
