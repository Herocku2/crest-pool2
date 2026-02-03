import { w3mProvider } from "@web3modal/ethereum";
import { configureChains, createClient } from "wagmi";
import { bscTestnet, bsc, sepolia } from "wagmi/chains";
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { InjectedConnector } from 'wagmi/connectors/injected';

export const projectId = "ed32b09c3d1de8d510891bc5fe95391a";
const chains = [
  bsc,
  ...(process.env.NODE_ENV === 'development' ? [bscTestnet] : []),
]
const { provider } = configureChains(chains, [w3mProvider({ projectId })]);
export const wagmiClient = createClient({
  autoConnect: true,
  connectors: [
    new WalletConnectConnector({ 
      chains, 
      options: { 
        projectId, 
        showQrModal: false, 
        metadata: {
            name: 'The Crest Swap',
            description: 'The Crest Swap Interface',
            url: 'https://crestpool.com',
            icons: ['https://crestpool.com/logo.png']
        }
      } 
    }),
    new InjectedConnector({ 
      chains,
      options: {
        shimDisconnect: true,
      }
    })
  ],
  provider,
});

export { chains };
