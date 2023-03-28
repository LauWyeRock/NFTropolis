import React, { useState, useEffect, useContext } from "react";

//INTERNAL IMPORT
import Style from "../styles/index.module.css";
import {
  HeroSection,
  BigNFTSilder,
  Title,
  Category,
  Filter,
  NFTCard,
  FollowerTab,
  Slider,
  Loader,
} from "../components/componentsindex";

//IMPORTING CONTRCT DATA
import { NFTMarketplaceContext } from "../Context/NFTMarketplaceContext";

const Home = () => {
  const { checkIfWalletConnected, currentAccount } = useContext(
    NFTMarketplaceContext
  );
  useEffect(() => {
    checkIfWalletConnected();
  }, []);

  const { fetchNFTs } = useContext(NFTMarketplaceContext);
  const [nfts, setNfts] = useState([]);
  const [nftsCopy, setNftsCopy] = useState([]);

  useEffect(() => {
    // if (currentAccount) {
    fetchNFTs().then((items) => {
      console.log(nfts);
      setNfts(items.reverse());
      setNftsCopy(items);
    });
    // }
  }, []);


  return (
    <div className={Style.homePage}>
      <HeroSection />
      <BigNFTSilder />
      
      <Slider />
      <Title
        heading="Featured NFTs"
        paragraph="Discover the most outstanding NFTs in all topics of life."
      />
      <Filter />
      {nfts.length == 0 ? <Loader /> : <NFTCard NFTData={nfts} />}

      <Title
        heading="Browse by category"
        paragraph="Explore the NFTs in the most featured categories."
      />
      <Category />
     
  
    </div>
  );
};

export default Home;