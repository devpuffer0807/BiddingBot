# NFTTOOLS Bidding Bot Interface

This project is a Next.js application designed to provide an interface for an NFT bidding bot. The bot supports platforms like OpenSea, MagicEden, and Blur, allowing users to automate their bids and maximize profits.

## Getting Started

### Prerequisites

- Node.js version 18 or above
- npm, yarn, pnpm, or bun package manager

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/nfttools-bidding-bot-interface.git
   cd nfttools-bidding-bot-interface
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

### Setup

1. Create a `.env` file in the root directory and add the necessary environment variables:

   ```env
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   EMAIL_USERNAME=your_email_username
   EMAIL_PASSWORD=your_email_password
   CLIENT_URL=your_client_url
   NEXT_PUBLIC_CLIENT_URL=your_public_client_url
   NEXT_PUBLIC_SERVER_WEBSOCKET=your_server_websocket_url
   ```

2. Run the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
