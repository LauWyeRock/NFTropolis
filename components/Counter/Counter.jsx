import React from 'react';
import Countdown from 'react-countdown';
import { LotteryContext } from '@/Context/LotteryContext';

function CountdownTimer({ hours, minutes, seconds, completed }) {
    // const { duration
        // } = useContext(LotteryContext);
    
    const renderer = ({hours, minutes, seconds, completed}) => {
        if (completed) {
            return (
                <div>
                    <h2 className='text-white text-xl text-center animate-bounce'>Ticket sales have now closed for this draw</h2>
                    <div className="flex space-x-6">
                    <div className='flex-1'>
                        <div className='countdown animate-pulse'>{hours}</div>
                        <div className='countdown-label'>hours</div>
                    </div>

                    <div className='flex-1'>
                        <div className='countdown animate-pulse'>{minutes}</div>
                        <div className='countdown-label'>minutes</div>
                    </div>

                    <div className='flex-1'>
                        <div className='countdown animate-pulse'>{seconds}</div>
                        <div className='countdown-label'>seconds</div>
                    </div>

                </div>
                
                </div>
            )
        } else {
            return (
            <div>
                <h3 className='text-white text-sm mb-2 italic'>Time remaining</h3>
                <div className="flex space-x-6">
                    <div className='flex-1'>
                        <div className='countdown animate-pulse'>{hours}</div>
                        <div className='countdown-label'>hours</div>
                    </div>

                    <div className='flex-1'>
                        <div className='countdown animate-pulse'>{minutes}</div>
                        <div className='countdown-label'>minutes</div>
                    </div>

                    <div className='flex-1'>
                        <div className='countdown animate-pulse'>{seconds}</div>
                        <div className='countdown-label'>seconds</div>
                    </div>

                </div>
            </div>
            
            )
        }
    };

    return (
     <div>
         {/* <Countdown date={new Date(expiration * 1000)} renderer={renderer} /> */}
     </div>
   )
}

export default CountdownTimer