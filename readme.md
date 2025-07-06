# Hedging Assets with On-Chain PUT Options

This project enables users to hedge against asset price drops by buying on-chain PUT options, powered by a Solidity smart contract and a modern Next.js web interface.


## Table of Contents

- [Description](#description)
- [Why Flow Blockchain?](#why-flow-blockchain)
- [Main Use Cases](#main-use-cases)
- [Architecture](#architecture)
- [How It Works](#how-it-works)
  - [Smart Contract (Backend)](#smart-contract-backend)
  - [Frontend (Web Interface)](#frontend-web-interface)
- [Installation & Getting Started](#installation--getting-started)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [Usage](#usage)

---

## Description

This project provides a decentralized platform to create, buy, and exercise PUT options on ERC20 (or ETH) assets, allowing users to hedge against price drops.  
The backend is a Solidity smart contract deployed on an EVM-compatible chain, and the frontend is a modern Next.js application.

---

## Why Flow Blockchain?

This project is deployed on the Flow blockchain for several reasons:

- **Scalability & Performance:** Flow is designed for high throughput and low-latency, making it ideal for financial applications that require fast and reliable transactions.
- **Low Fees:** Transaction costs on Flow are significantly lower than on many other blockchains, making options trading and frequent interactions affordable for all users.
- **EVM Compatibility:** With Flow's EVM support, Solidity smart contracts can be deployed and interacted with just like on Ethereum, while benefiting from Flow's unique infrastructure.
- **User Experience:** Flow prioritizes usability and onboarding, providing a smoother experience for both developers and end-users.
- **Ecosystem & Innovation:** Flow is home to a growing DeFi and NFT ecosystem, offering opportunities for integration and expansion.

By leveraging Flow, this project combines the security and flexibility of EVM smart contracts with the performance and user-friendliness of the Flow network.

---

## Main Use Cases

### 1. Protection for Stakers (Hedging)

**Who?**  Stakers or long-term holders of a crypto asset (e.g., ETH, a DeFi token, etc.).

**Why?**  Stakers are exposed to the risk of their asset's price dropping. If the market turns bearish, their staked value can decrease significantly.

**How does the platform help?**
- Stakers can **buy a PUT option** on their asset.
- If the asset price falls below the strike price, the staker can exercise the option and sell their asset at the strike price, thus limiting their loss.
- This acts as an **on-chain insurance** against price drops, providing peace of mind and financial security.

**Example:**
Alice stakes 1000 USDC worth of ETH. She buys a PUT option with a strike price of $2000. If ETH drops to $1500, she can exercise her option and sell at $2000, protecting her capital.

### 2. Yield Farmers: New Financial Product & Extra Yield

**Who?**  Yield farmers, liquidity providers, or DeFi users seeking to maximize returns.

**Why?**  Yield farmers are always looking for new ways to earn yield and diversify their strategies.

**How does the platform help?**
- Yield farmers can **sell PUT options** on assets they hold or are willing to acquire.
- By selling a PUT, they collect a **premium** from buyers (stakers seeking protection).
- If the option is not exercised, they keep the premium as extra yield.
- If exercised, they buy the asset at the strike price, which they may be comfortable with (e.g., as part of a buy-the-dip strategy).

**Example:**
Bob is a yield farmer with stablecoins. He sells PUT options on ETH with a strike price he finds attractive. If the market drops and the option is exercised, he buys ETH at a discount; if not, he keeps the premium as extra income.

| User Type    | Action     | Benefit                                 |
|-------------|------------|-----------------------------------------|
| Staker      | Buy PUT    | Protects against price drops (hedging)  |
| Yield Farmer| Sell PUT   | Earns premium, new DeFi yield strategy  |

This dual-sided market creates a win-win: stakers get protection, and yield farmers get a new source of yield, all in a decentralized, transparent way.

---

## Architecture

```
/backend
  └── src/PutOptionHandler.sol      # Main smart contract
  └── script/                      # Deployment scripts
  └── broadcast/                   # Deployment/interaction traces
  └── README.md, foundry.toml      # Foundry tools

/frontend
  └── src/                         # Next.js code (pages, components, hooks)
  └── prisma/                      # PutOption database model
  └── README.md, package.json      # Next.js config, dependencies
```

---

## How It Works

### Smart Contract (Backend)

The `PutOptionHandler` contract allows:

- **PUT Option Creation**: A seller deposits the strike amount in USDC, sets the strike price, premium, asset, quantity, and expiry.
- **Option Purchase**: A buyer pays the premium to the seller and receives the option.
- **Exercise**: The buyer can send the underlying asset to the contract to receive the strike in USDC.
- **Expiration**: If the option expires unexercised, the seller gets their deposit back.
- **Automation**: Chainlink Automation integration for handling expiries.

Main functions:
- `createPutOpt(strike, premium, expiry, asset, amount)`
- `buyOpt(optId)`
- `sendAsset(optId)`
- `deletePutOpt(optId)`

See [`backend/src/PutOptionHandler.sol`](backend/src/PutOptionHandler.sol) for details.

### Frontend (Web Interface)

- **Option Creation**: Form to propose a PUT option (strike, premium, asset, quantity, date).
- **Marketplace**: List of available options for purchase.
- **Dashboard**: Track created, bought, and exercised options.
- **Wallet Connection**: Wagmi/RainbowKit integration.
- **Database**: Options are recorded in a SQLite database via Prisma.

Key files:
- `src/components/forms/putForm.tsx`: option creation form
- `src/components/sections/putOptionList.tsx`: seller dashboard
- `src/components/sections/myOptions.tsx`: buyer dashboard
- `src/app/marketplace/page.tsx`: marketplace

---

## Installation & Getting Started

### Backend

Requirements: [Foundry](https://book.getfoundry.sh/), Node.js

```bash
cd backend
forge build         # Compile contracts
forge test          # Run tests
anvil               # Start a local node
# Deploy (adapt script and variables)
forge script script/deployPutHandler.sol:DeployPutOptionHandler --rpc-url <RPC_URL> --private-key <PRIVATE_KEY>
```

### Frontend

Requirements: Node.js, pnpm/yarn/npm

```bash
cd frontend
pnpm install        # or npm install / yarn install
pnpm dev            # or npm run dev / yarn dev
# Access http://localhost:3000
```

Configure the contract address and ABI in `src/lib/web3.ts` if needed.

---

## Usage

1. **Create a PUT Option**: Fill out the form (strike, premium, asset, quantity, date).
2. **Buy an Option**: Select an option on the marketplace and pay the premium.
3. **Exercise**: Send the underlying asset to receive the strike.
4. **Track**: Use the dashboard to view your created/bought options.






