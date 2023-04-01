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


//INTERNAL  IMPORT
import {
    VotingAddress,
    VotingABI,
  } from "./constants";

//---FETCHING SMART CONTRACT
const fetchContract = (signerOrProvider) =>
  new ethers.Contract(
    VotingAddress,
    VotingABI,
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

export const VotingContext = React.createContext();

export const VotingProvider = ({ children }) => {

    const [account, setAccount] = useState("");
    const [duration, setDuration] = useState([]);
    const [expiration, setExpiration] = useState([]);
    const [proposalId, setProposalId] = useState("");
    const [totalProposals, setTotalProposals] = useState([]);
    const [error, setError] = useState("");

    const router = useRouter();

    const fetchData = async () => {
        try {
          //GET CONTRACT
          const contract = await connectingWithContract();
          //GET ACCOUNT
          const connectAccount = await connectWallet();
          setAccount(connectAccount);
          //GET totalTickets
          const totalProposals = await contract.getTotalNumberOfProposals();
          setTotalProposals(totalProposals);

          const expiration = Date.now()
          setExpiration(expiration);

          //Set constants
          setProposalId(0)
    
        } catch (error) {
          // setError("Please Install And Connect Your Wallet");
          console.log(error);
        }
      };
      useEffect(() => {
        fetchData();
      }, []);

    const createProposal = async (question) => {
        try {
            const contract = await connectingWithContract();
            const proposal = await contract.createProposal(question);
            await proposal.wait();
            const inc = proposalId + 1
            setProposalId(inc);
            
          } catch (error) {
            setError("Error while creating proposal");
            console.log(error);
          }
    }

    const vote = async (proposalId, yesOrNo) => {
        try {
            const contract = await connectingWithContract();
            const proposal = await contract.vote(proposalId, yesOrNo);
            await proposal.wait();
      
          } catch (error) {
            setError("Error while creating proposal");
            console.log(error);
          }
    }

    const getProposalResult = async (proposalId) => {
        try {
            const contract = await connectingWithContract();
            const proposal = await contract.getProposalResult(proposalId);
            await proposal.wait();
            return proposal;
        } catch (error) {
            setError("Error while creating proposal");
            console.log(error);
        }
    }

    const getTotalNumberOfProposals = async () => {
      try {
        const contract = await connectingWithContract();
        const proposal = await contract.getTotalNumberOfProposals();
        await proposal.wait();
      } catch (error) {
        setError("Error while getting");
        console.log(error);
      }
    }

    return(
        <VotingContext.Provider
      value={{
        connectWallet,
        CheckIfWalletConnected,
        createProposal,
        vote,
        getProposalResult,
        getTotalNumberOfProposals,
      }}
    >
      {children}
    </VotingContext.Provider>
    );
}