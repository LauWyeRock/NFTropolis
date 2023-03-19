import "../styles/globals.css";

//INTRNAL IMPORT
import { NavBar, Footer } from "../components/componentsindex";
import { NFTMarketplaceProvider } from "../Context/NFTMarketplaceContext";
import { ChatAppProvider } from "../Context/ChatAppContext";

const MyApp = ({ Component, pageProps }) => (
  <div>
    <NFTMarketplaceProvider>
    <ChatAppProvider>
      <NavBar />
      <Component {...pageProps} />
      <Footer />
      </ChatAppProvider>
    </NFTMarketplaceProvider>
  </div>
);

export default MyApp;