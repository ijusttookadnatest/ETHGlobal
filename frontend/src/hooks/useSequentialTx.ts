import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useState, useEffect } from 'react';

export function useSequentialTransactions() {
  const [currentStep, setCurrentStep] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const { writeContract, data: hash, error } = useWriteContract();
  const { isSuccess, isLoading } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess && currentStep < transactions.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [isSuccess, currentStep, transactions.length]);

  const executeSequence = (txSequence: any[]) => {
    setTransactions(txSequence);
    setCurrentStep(0);
    if (txSequence.length > 0) {
      writeContract(txSequence[0]);
    }
  };

  // Exécute la transaction suivante quand l'étape change
  useEffect(() => {
    if (currentStep > 0 && currentStep < transactions.length) {
      writeContract(transactions[currentStep]);
    }
  }, [currentStep]);

  const isComplete = currentStep === transactions.length - 1 && isSuccess;

  return {
    executeSequence,
    isLoading,
    isComplete,
    currentStep,
    error
  };
}