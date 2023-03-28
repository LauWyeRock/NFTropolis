import "../styles/globals.css";

//INTRNAL IMPORT
import { NavBar, Footer, NavBar2 } from "../components/componentsindex";
import { NFTMarketplaceProvider } from "../Context/NFTMarketplaceContext";
import { ChatAppProvider } from "../Context/ChatAppContext";
import { LotteryProvider } from "@/Context/LotteryContext";

const MyApp = ({ Component, pageProps }) => (
  <div>
    <NFTMarketplaceProvider>
      <NavBar />
        <ChatAppProvider>
          <LotteryProvider>
            <Component {...pageProps} />
          <Footer />
          </LotteryProvider>
        </ChatAppProvider>
    </NFTMarketplaceProvider>
  </div>
);

export default MyApp;