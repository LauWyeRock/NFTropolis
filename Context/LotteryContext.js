import React, { useState, useEffect } from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import axios from "axios";
//INTERNAL IMPORT
import {
    CheckIfWalletConnected,
    connectWallet,
  } from "../Utils/apiFeature";

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
const projectSecretKey = process.env.NEXT_PUBLIC_SECRECT_KEY;
const auth = `Basic ${Buffer.from(`${projectId}:${projectSecretKey}`).toString(
  "base64"
)}`;

const subdomain = process.env.NEXT_PUBLIC_SUBDOMAIN;

//INTERNAL  IMPORT
import {
    LotteryAddress,
    LotteryABI,
  } from "./constants";

//---FETCHING SMART CONTRACT
const fetchContract = (signerOrProvider) =>
  new ethers.Contract(
    LotteryAddress,
    LotteryABI,
    signerOrProvider
  );

//---CONNECTING WITH SMART CONTRACT
const connectingWithContract = async () => {
    try {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
  
      const contract = fetchContract(signer);
      return contract;
    } catch (error) {
      console.log("Something went wrong while connecting with contract", error);
    }
  };

  export const LotteryContext = React.createContext();

  export const LotteryProvider = ({ children }) => {
  
    //------USESTAT
    const [error, setError] = useState("");
    const [openError, setOpenError] = useState(false);
    const [account, setAccount] = useState("");
    const [ticketPrice, setTicketPrice] = useState("");
    const [maxTickets, setMaxTickets] = useState("");
    const [ticketCommission, setTicketCommission] = useState([]);
    const [duration, setDuration] = useState([]);
    const [expiration, setExpiration] = useState([]);

    const [totalTickets, setTotalTickets] = useState([]);
    const [currenWinningReward, setCurrenWinningReward] = useState([]);
    const [remainingTickets, setRemainingTickets] = useState([]);
    const [winningsAmount, setWinningsAmount] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const router = useRouter();
  
    //FETCH DATA TIME OF PAGE LOAD
  const fetchData = async () => {
    try {
      //GET CONTRACT
      const contract = await connectingWithContract();
      //GET ACCOUNT
      const connectAccount = await connectWallet();
      setAccount(connectAccount);
      //GET totalTickets
      const totalTickets = await contract.getTickets();
      setTotalTickets(totalTickets);
      //GET currenWinningReward
      const currenWinningReward = await contract.CurrentWinningReward();
      ethers.utils.formatEther(currenWinningReward.toString())
      setCurrenWinningReward(currenWinningReward);
      //GET remainingTickets
      const remainingTickets = await contract.RemainingTickets();
      setRemainingTickets(remainingTickets);
      //GET winningsAmount
      const winningsAmount = await contract.checkWinningsAmount();
      setWinningsAmount(winningsAmount);

      

      const expiration = Date.now()
      setExpiration(expiration);
      //Set constants
      setTicketPrice(0.01)
      setMaxTickets(100)
      setTicketCommission(0.001)
      setDuration(30)

    } catch (error) {
      // setError("Please Install And Connect Your Wallet");
      console.log(error);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  
  //Buy X Number of Tickets
  const buyTicket = async (numberOfTickets ) => {
    try {
      const contract = await connectingWithContract();
      const totalCost = numberOfTickets * parseFloat(ticketPrice);
      
       console.info(ethers.utils.parseEther(
        totalCost.toString()).toString())
      const transaction = await contract.BuyTickets( {
        value: ethers.utils.parseEther(
          totalCost.toString(),
        )
      });
      setLoading(true);
      await transaction.wait();
      setLoading(false);

      const remainingTickets = await contract.RemainingTickets();
      setRemainingTickets(remainingTickets);
      // window.location.reload();

      console.log("price is" + price)
      console.log("remainingticks" + remainingTickets)
    } catch (error) {
      setError("Error while buying ticket");
      console.log(error);
    }
  };


    //---Draw Winner ticket
    const drawWinnerTicket = async () => {
        try {
            const contract = await connectingWithContract();
            const drawWinner = await contract.DrawWinnerTicket();
            setLoading(true);
            await drawWinner.wait();
            setLoading(false);
            // router.push("/");
            window.location.reload();
        } catch(error) {
            setError("Something went wrong drawing Winner");
        }

    };

    const withdrawWinnings = async () => {
      try {
        const contract = await connectingWithContract();
        const withdrawWinnings = await contract.DrawWinnerTicket();
        setLoading(true);
        await withdrawWinnings.wait();
        setLoading(false);
        // router.push("/");
        window.location.reload();
      } catch(error) {
        setError("Something went wrong withdrawing Winnings");
      }
    }

    return(
        <LotteryContext.Provider
      value={{
        buyTicket,
        drawWinnerTicket,
        connectWallet,
        CheckIfWalletConnected,
        account,
        ticketPrice,
        maxTickets,
        ticketCommission,
        duration,
        totalTickets,
        currenWinningReward,
        remainingTickets,
        winningsAmount,
        expiration,
        withdrawWinnings
      }}
    >
      {children}
    </LotteryContext.Provider>
    );

}
