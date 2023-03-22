import React, { useState, useEffect, useContext } from "react";
import Image from "next/image";
import formStyle from "../AccountPage/Form/Form.module.css";
import Card from "@/components/Friend/Card/Card";
import CountdownTimer from "@/components/Counter/Counter";

//INTERNAL IMPORT
import Style from "../styles/lottery.module.css";
import images from "../img";

//IMPORT FROM SMART CONTRACT
import { LotteryContext } from "../Context/LotteryContext";

const lottery = () => {
 // const { uploadToIPFS, createNFT } = useContext(NFTMarketplaceContext);
    const [ userTickets, setUserTickets] = useState(0);
    const {currenWinningReward
    } = useContext(LotteryContext);
    const [quantity, setQuantity] = useState(1);

    return (
        
         
        <div className={Style.uploadNFT}>
        <div className={Style.uploadNFT_box}>
          <div className={Style.uploadNFT_box_heading}>
            <h1>Lottery Game</h1>
            
            <p>
              The next draw:
            </p>
          </div>
          <div className={formStyle.Form_box_input_social}>
          <div className={Style.stats}>
            <label htmlFor="Royalties">Royalties</label>
            <h2 className='text-sm'>Total Pool</h2>
              <p className='text-xl'>
                {currenWinningReward && ethers.utils.formatEther(currenWinningReward?.toString())}
              </p>
          </div>
          
          <div className={Style.stats}>
            <label htmlFor="Propertie">Propertie</label>
            <h2 className='text-sm'>Tickets Left</h2>
              <p className='text-xl'>
                {remainingTickets?.toNumber()}
              </p>
          </div>

        </div>
        <CountdownTimer/>
          {/* <div className={Style.uploadNFT_box_title}>
            <h2>Image, Video, Audio, or 3D Model</h2>
            <p>
              File types supported: JPG, PNG, GIF, SVG, MP4, WEBM, MP3, WAV, OGG,
              GLB, GLTF. Max size: 100 MB
            </p>
          </div>
   */}
          
        </div>
      </div>
    
          
        
        
      )
}

export default lottery;

