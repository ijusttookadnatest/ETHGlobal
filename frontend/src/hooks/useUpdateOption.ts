import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { optionManagerABI, erc20ABI, OPTION_MANAGER_ADDRESS, USDC_ADDRESS } from '@/lib/web3';
import { useSequentialTransactions } from './useSequentialTx';

export function useBlockchainBuyOption() {
  const { executeSequence, isLoading, isComplete, error } = useSequentialTransactions();

  const blockchainBuyOption = async (optionId: string, premium: string) => {
    const transactions = [
      // 1. Approve premium
      {
        address: USDC_ADDRESS,
        abi: erc20ABI,
        functionName: 'approve',
        args: [OPTION_MANAGER_ADDRESS, BigInt(premium)]
      },
      // 2. Buy option
      {
        address: OPTION_MANAGER_ADDRESS,
        abi: optionManagerABI,
        functionName: 'buyOpt',
        args: [BigInt(optionId)]
      }
    ];

    executeSequence(transactions);
  };

  return {
    blockchainBuyOption,
    isLoading,
    isSuccess: isComplete,
    error
  };
}
type Address = `0x${string}`;

export function BlockchainSendAssetToContract() {
  const { executeSequence, isLoading, isComplete, error } = useSequentialTransactions();

  const blockchain_sendAssetToContract = async ({
    optionId,
    asset,
    amount,
    isETH = false
  }: {
    optionId: string,
    asset: string | Address,
    amount: string,
    isETH?: boolean
  }) => {
    if (isETH) {
      // Pour ETH, une seule transaction
      const transactions = [{
        address: OPTION_MANAGER_ADDRESS,
        abi: optionManagerABI,
        functionName: 'sendAsset',
        args: [BigInt(optionId)],
        value: BigInt(amount)
      }];
      executeSequence(transactions);
    } else {
      // Pour ERC20, approve puis send
      const transactions = [
        {
          address: asset as Address,
          abi: erc20ABI,
          functionName: 'approve',
          args: [OPTION_MANAGER_ADDRESS, BigInt(amount)]
        },
        {
          address: OPTION_MANAGER_ADDRESS,
          abi: optionManagerABI,
          functionName: 'sendAsset',
          args: [BigInt(optionId)]
        }
      ];
      executeSequence(transactions);
    }
  };

  return {
    blockchain_sendAssetToContract,
    isLoading,
    isSuccess: isComplete,
    error
  };
}

// Hook for reclaiming asset from contract
export function BlockchainReclaimAssetFromContract() {
  const { writeContract, data: hash, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });
  //const { address } = useAccount();

  const blockchain_reclaimAssetFromContract =  ({
    optionId
  }: {
    optionId: string
  }) => {
    try {
      writeContract({
        address: OPTION_MANAGER_ADDRESS,
        abi: optionManagerABI,
        functionName: 'reclaimAsset',
        args: [BigInt(optionId)]
      });

      return true;
    } catch (err) {
      console.error('Error reclaiming asset from contract:', err);
      return false;
    }
  };

  return {
    blockchain_reclaimAssetFromContract,
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error
  };
}

export function useUpdateOption() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateOption = async (
    id: number,
    updates: { buyer_address?: string; asset_transfered?: boolean }
  ) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/options/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) throw new Error('Failed to update option');

      const result = await response.json();

      return result.data;
    } catch (err) {
      setError(err as Error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateOption, isLoading, error };
}
