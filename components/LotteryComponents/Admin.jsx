import React from 'react'
import { ethers } from 'ethers';
import toast from "react-hot-toast"
import { useContext } from 'react';
import { LotteryContext } from '@/Context/LotteryContext';

function Admin() {

    const {DrawWinnerTicket, restartDraw
    } = useContext(LotteryContext);
    
    const drawWinner = async () => {
        const notification = toast.loading("Picking a winner...")
    
        try {
            const data = await DrawWinnerTicket([{}])
            toast.success("A winner has been selected", {
                id:notification,
            })
            console.info("contract call success", data)
        } catch (err) {
            toast.error("Whoops something went wrong", {
                id:notification,
            })
            console.error("Contract call failure", err)
        }
      }

      
  const onRestartDraw = async () => {
    const notification = toast.loading("Restarting draw...")

    try {
        const data = await restartDraw([{}])
        toast.success("A winner has been selected", {
            id:notification,
        })
        console.info("contract call success", data)
    } catch (err) {
        toast.error("Whoops something went wrong", {
            id:notification,
        })
        console.error("Contract call failure", err)
    }
  }

    return (
        <div className='text-white text-center px-5 py-3 rounded-md
        border-emerald-300/20 border'>
          <h2 className='font-bold'>AdminControls</h2>
          <p className='mb-5'>Total Commission to be withdrawn:{" "}
          {/* {totalCommission && ethers.utils.formatEther(totalCommission?.toString())}{" "}
          {currency} */}
          </p>
    
        <div className='flex flex-col space-y-2 md:flex-row md:space-y-0
        md:space-x-2'>
            <button onClick={drawWinner} className='admin-button'>
                {/* <StarIcon className='h-6 mx-auto mb-2' /> */}
                Draw Winner
            </button>
            {/* <button onClick={onWithdrawCommission} className='admin-button'>
                <CurrencyDollarIcon className='h-6 mx-auto mb-2' />
                Withdraw Commission
            </button> */}
            <button onClick={onRestartDraw} className='admin-button'>
                {/* <ArrowPathIcon className='h-6 mx-auto mb-2'/> */}
                    Restart Draw
            </button>
            {/* <button onClick={onRefundAll} className='admin-button'>
                <ArrowUturnDownIcon className='h-6 mx-auto mb-2' />
                Refund all
            </button> */}
        </div>
        </div>
      )
}

export default Admin