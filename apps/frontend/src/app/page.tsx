import { siteConfig, whatsappLink } from "@/config/site";

const capabilities = [
  {
    title: "Send & receive",
    body: "Move XLM and Stellar assets to any phone contact with a chat message.",
  },
  {
    title: "Swap",
    body: "Trade assets through Stellar's built-in DEX and Soroban AMMs, quoted in chat.",
  },
  {
    title: "Deploy contracts",
    body: "Ship Soroban smart contracts to testnet or mainnet without leaving the conversation.",
  },
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-12 px-6 py-24 bg-zinc-50 font-sans dark:bg-black">
      <div className="flex max-w-2xl flex-col items-center gap-6 text-center">
        <span className="rounded-full border border-zinc-200 px-4 py-1 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
          Running on Stellar {siteConfig.stellarNetwork}
        </span>
        <h1 className="text-5xl font-semibold tracking-tight text-black dark:text-zinc-50">
          {siteConfig.name}
        </h1>
        <p className="text-2xl font-medium text-zinc-800 dark:text-zinc-200">
          {siteConfig.tagline}
        </p>
        <p className="max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          {siteConfig.description}
        </p>
        <a
          href={whatsappLink()}
          className="flex h-12 items-center justify-center rounded-full bg-black px-8 font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
        >
          Open Hashport in WhatsApp
        </a>
      </div>
      <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-3">
        {capabilities.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <h2 className="mb-2 font-semibold text-black dark:text-zinc-50">{item.title}</h2>
            <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">{item.body}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
