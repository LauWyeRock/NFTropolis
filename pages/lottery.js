import React, { useState, useEffect, useContext } from "react";
import Image from "next/image";
import formStyle from "../AccountPage/Form/Form.module.css";
import Card from "@/components/Friend/Card/Card";
import CountdownTimer from "@/components/Counter/Counter";
// import { TextField } from "@mui/material";
import { ethers } from "ethers";
import toast from "react-hot-toast"

//INTERNAL IMPORT
import Style from "../styles/lottery.module.css";
import images from "../img";

//IMPORT FROM SMART CONTRACT
import { LotteryContext } from "../Context/LotteryContext";
import { Button } from "@/components/componentsindex";
import Admin from "@/components/LotteryComponents/Admin";

const lottery = () => {
 // const { uploadToIPFS, createNFT } = useContext(NFTMarketplaceContext);
    const [ userTickets, setUserTickets, ] = useState(0);
    const {currenWinningReward, remainingTickets, ticketPrice, ticketCommission, expiration, buyTicket, withdrawWinnings
    } = useContext(LotteryContext);
    const [quantity, setQuantity] = useState(1);

    const handleClick = async () => {
      if (!ticketPrice) return;
  
      const notification = toast.loading("Buying your tickets...")
  
      try {
        const data = await buyTicket(quantity)
  
        toast.success("Tickets purchased successfully", {
          id: notification
        })
        console.info("Contract call success", remainingTickets.toString())
        // setQuantity(0)
        // window.location.reload();
      } catch(err) {
        toast.error("Whoops something went wrong!", {
          id: notification,
        })
        console.error("contract call failure", err)
      }
    }

    const onWithdrawWinnings = async () => {
      const notification = toast.loading("Withdrawing winnings... ")
      
      try {
        const data = await withdrawWinnings();
        toast.success("Winnings withdrawn successfully!", {
          id: notification,
        })
        console.info("Contract call success", data)
      } catch (err) {
        toast.error("Whoops something went wrong!", {
          id: notification,
        });
  
          console.error("Contract call failure", err)
      }
    
    }

    return (
        
         
        <div className={Style.wholepage}>
          <div className={Style.uploadNFT}>
           
              {/* <Admin></Admin> */}
              <div className={Style.stats_container}>

              {/* {isLotteryOperator === address && (
                <div className='flex justify-center'>
                  <AdminControls />
                </div>
              )} */}

              {parseInt(currenWinningReward.toString()) > 0 && (
                <div className='max-w-md md:max-w-2xl lg:max-w-4xl mx-auto mt-5'>
                  <button onClick={onWithdrawWinnings} className="p-5
                  bg-gradient-to-b from-orange-500 to-emerald-600 animate-pulse
                  text-center rounded-xl-w-full">
                    <p className='font-bold'>Winner winner chicken dinner
                    </p>  
                    <p>
                      Total Winnings: {currenWinningReward.toString()}{" "}
                      
                    </p>
                    <br />
                    <p className='font-semibold'>Click here to withdraw</p>
                  </button>
                  </div>
              )}

                <h1>Lottery Game</h1>
                <p>
                  The next draw:
                </p>

                <div className={Style.stats}>              
                  <h2 className='text-sm'>Total Pool</h2>
                  <p className='text-xl'>
                    
                    {currenWinningReward.toString()}
                    {/* && ethers.utils.formatEther(currenWinningReward?.toString()) */}
                  </p> 
                </div>  
                <br></br>
                <div className={Style.stats}>    
                  <h2 className='text-sm'>Tickets Left</h2>
                  <p className='text-xl'>
                   
                    {remainingTickets.toString()}
                    {/* ?.toNumber() */}
                    
                  </p>
                </div>
                <div>
                  <CountdownTimer/>
                </div>
              </div>

              
              

              <div className={Style.stats_container}>
                <div className = {Style.stats}>
                    <div className={Style.header}>
                    <h2>Price per ticket</h2>
                    {/* <p>$10</p> */}
                    <p>{ticketPrice && ticketPrice.toString()}</p>
                    
                    {/* {" "} {currency} */}
                    </div>

                    <div className={Style.ticketContainer}>
                      <p>TICKETS</p>
                      <input className='ticket_quantity' type="number" min={1} max={10} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))}/>
                    </div>

                      <div className={Style.ticket_info_container}>
                        <div className={Style.ticket_info}>
                          <p>Total cost of tickets</p>
                          {/* <p>TBC</p> */}
                          <p>{ticketPrice && (ticketPrice.toString() * quantity)}</p>
                          {/* {" "} {currency} */}
                        </div>

                        <div className={Style.ticket_info}>
                          <p>Service fees</p>
                          {/* <p>TBC</p> */}
                          <p>{ticketCommission && ticketCommission.toString()}</p>
                          {/* {" "} {currency} */}
                        </div>

                        <div className={Style.ticket_info}>
                          <p>Network fees</p>
                          <p>TBC</p>
                        </div>
                       
                        <Button
                          btnName= "Buy Tickets"
                          handleClick={handleClick}
                          disabled ={parseInt(remainingTickets) == 0} 
                          >                          
                           {/* "Buy {quantity} tickets for{" "} 
                            {ticketPrice && 
                            ticketPrice.toString() *
                            quantity}{" "}" */}
                        </Button>
                      </div>
                    </div>                 
                    </div>
 
          </div>
          
      </div>
       
        
      )
}

export default lottery;

