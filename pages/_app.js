import "../styles/globals.css";

//INTRNAL IMPORT
import { NavBar, Footer, NavBar2 } from "../components/componentsindex";
import { NFTMarketplaceProvider } from "../Context/NFTMarketplaceContext";
import { ChatAppProvider } from "../Context/ChatAppContext";
import { LotteryProvider } from "@/Context/LotteryContext";
import { VotingProvider } from "@/Context/VotingContext";

const MyApp = ({ Component, pageProps }) => (
  <div>
    <NFTMarketplaceProvider>
      <NavBar />
        <ChatAppProvider>
          <LotteryProvider>
            <VotingProvider>
            <Component {...pageProps} />
          <Footer />
          </VotingProvider>
          </LotteryProvider>
        </ChatAppProvider>
    </NFTMarketplaceProvider>
  </div>
);

export default MyApp;