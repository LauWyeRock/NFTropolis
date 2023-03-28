import React from 'react';
import Countdown from 'react-countdown';
import { LotteryContext } from '@/Context/LotteryContext';
import Style from "./counter.module.css";
import { useEffect, useContext } from 'react';

function CountdownTimer({ hours, minutes, seconds, completed }) {
    const { drawWinnerTicket
        } = useContext(LotteryContext);
    const expiration = Date.now()
    const renderer = ({hours, minutes, seconds, completed}) => {
        if (completed) {
            // Render a completed state
            const drawWinner = async () => {
                try {
                    const data = await drawWinnerTicket();
                    console.info("draw winner ticket call success", data)
                } catch  (error) {
                
                console.log(error);
                }
            }
            
            
            drawWinner();
             
            return (
                <div>
                    <h2 className='text-white text-sm mb-2 italic'>Lottery has expired</h2>
                    <div className={Style.flex}>
                        
                        <div className={Style.flex-1}>
                            <div className={Style.countdown}>{hours}</div>
                            <div className={Style.countdown.label}> hours </div>
                        </div>
                        <div className={Style.flex-1}>
                            <div className={Style.countdown}>{minutes}</div>
                            <div className={Style.countdown.label}> minutes </div>
                        </div>
                        <div className={Style.flex-1}>
                        <   div className={Style.countdown}>{seconds}</div>
                            <div className={Style.countdown.label}> seconds </div>
                        
                        </div>
                    </div>
                </div>
                )
          } else {
            // Render a countdown
            return (
            <div>
                <h2 className='text-white text-sm mb-2 italic'>Time remaining</h2>
                <div className={Style.flex}>
                    
                    <div className={Style.flex-1}>
                        <div className={Style.countdown}>{hours}</div>
                        <div className={Style.countdown.label}> hours </div>
                    </div>
                    <div className={Style.flex-1}>
                        <div className={Style.countdown}>{minutes}</div>
                        <div className={Style.countdown.label}> minutes </div>
                    </div>
                    <div className={Style.flex-1}>
                    <   div className={Style.countdown}>{seconds}</div>
                        <div className={Style.countdown.label}> seconds </div>
                    
                    </div>
                </div>
            </div>
            )
          }
    };

    return (
     <div>
         <Countdown date={expiration + 10000} renderer={renderer} />
     </div>
   )
}

export default CountdownTimer