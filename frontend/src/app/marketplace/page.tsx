"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useGetOptions } from "@/hooks/useGetOptions";
import { useBlockchainBuyOption } from "@/hooks/useUpdateOption";
import { useWatchContractEvent } from "wagmi";
import { OPTION_MANAGER_ADDRESS, optionManagerABI } from "@/lib/web3";
import { useUpdateOption } from "@/hooks/useUpdateOption";
import { useGetOption } from "@/hooks/useGetOption";


export default function Marketplace() {
  const { data: options, isLoading } = useGetOption('buyer', 'null');

  const now = Date.now();
  const availableOptions = (options || []).filter(option =>
    !option.buyer_address && new Date(option.expiry).getTime() > now
  );

  const { blockchainBuyOption } = useBlockchainBuyOption();
  const { updateOption } = useUpdateOption();
  useWatchContractEvent({
    address: OPTION_MANAGER_ADDRESS,
    abi: optionManagerABI,
    eventName: "OptBought",
    onLogs(logs) {
      console.log('New logs BUY!', logs[0].args.optId);
      const optId = logs[0].args.optId ? logs[0].args.optId.toString() : "0";
      const optIdNumber = Number(optId);
      const buyer = logs[0].args.buyer ? logs[0].args.buyer.toString() : "";

      updateOption(optIdNumber, { buyer_address: buyer });
    }
  });

  const handleClick = async (id: number, premium: number) => {
    await blockchainBuyOption(String(id), String(premium));
  };

  //console.log(options);
  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="w-full max-w-5xl mx-auto">
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-center py-4">
            Marketplace – Buy Put Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-lg py-6">ETH Amount</TableHead>
                  <TableHead className="text-lg py-6">Strike Price (USD)</TableHead>
                  <TableHead className="text-lg py-6">Expiry</TableHead>
                  <TableHead className="text-lg py-6">Seller Address</TableHead>
                  <TableHead className="text-right text-lg py-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {availableOptions.map((option, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-lg py-6">{option.amount} ETH</TableCell>
                    <TableCell className="text-lg py-6">${option.strike_price}</TableCell>
                    <TableCell className="text-lg py-6">
                      {new Date(option.expiry).toLocaleString()} UTC
                    </TableCell>
                    <TableCell className="text-lg py-6 font-mono">
                      {option.seller_address.slice(0, 6)}...{option.seller_address.slice(-4)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        // onClick={() => handleClick(option.id, option.premium_price)}
                        className="md:text-lg">
                        Buy Option
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {availableOptions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-lg text-muted-foreground">
                      No available options found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

