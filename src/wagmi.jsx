import { w3mConnectors, w3mProvider } from "@web3modal/ethereum";
import { configureChains, createClient } from "wagmi";
import { bscTestnet, bsc,sepolia } from "wagmi/chains";

export const projectId = "ed32b09c3d1de8d510891bc5fe95391a";
const chains = [
  bsc,
  ...(process.env.NODE_ENV === 'development' ? [bscTestnet] : []),
]
const { provider } = configureChains(chains, [w3mProvider({ projectId })]);
export const wagmiClient = createClient({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  provider,
});

export { chains };
