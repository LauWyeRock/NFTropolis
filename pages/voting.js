import React, { useState, useEffect, useContext } from "react";
import Image from "next/image";
import formStyle from "../AccountPage/Form/Form.module.css";
import Card from "@/components/Friend/Card/Card";
import CountdownTimer from "@/components/Counter/Counter";
// import { TextField } from "@mui/material";
import { ethers } from "ethers";
import toast from "react-hot-toast";

//INTERNAL IMPORT
import Style from "../styles/lottery.module.css";
import images from "../img";

//IMPORT FROM SMART CONTRACT
import { VotingContext } from "../Context/VotingContext";
import { Button } from "@/components/componentsindex";

const voting = () => {
  const { createProposal, vote, getProposalResult, getTotalNumberOfProposals } = useContext(VotingContext);
  const [question, setQuestion] = useState("");
  const [selected, setSelected] = useState(1);
  const [proposals, setProposals] = useState([]);
  const classes = {
    th: "px-6 py-3 text-left text-xs font-bold text-gray-100 uppercase tracking-wider",
    td: "px-6 py-4 whitespace-nowrap"
  }

  useEffect(() => {
    (async () => {
      try {
        let listProposals = [];
        const numOfProposals = getTotalNumberOfProposals();
        for (let i = 0; i < numOfProposals; i++) {
          const proposal = getProposalResult(i);
          listProposals.push(proposal);
          setProposals(listProposals)
        }
      } catch (error) {
        console.log(error);
      }
    })
  })

  const makeproposal = async () => {
    try {
      const data = await createProposal(question);
      console.info("Contract call success", data);
      
    } catch (err) {
      console.log(err);
    }
  };

  const castyesvote = async () => {
    try {
      const data = await vote(0, true);
      console.info("Contract call success", data);
    } catch (err) {
      console.log(err);
    }
  };

  const castnovote = async (proposalId) => {
    try {
      const data = await vote(0, false);
      console.info("Contract call success", data);
    } catch (err) {
      console.log(err);
    }
  };

  const getall = async (proposalId) => {
    try {
      const data = await getProposalResult(0);
      console.info("Contract call success", data);
      console.log(data[0]);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    props.onVote(selected);
  };

  const handleSelect = (e) => {
    setSelected(Number(e.target.value));
  };

  return (
    <div className={Style.wholepage}>
      <div className={Style.uploadNFT}>
        <div className={Style.stats_container}>
          <h1>Voting Page</h1>
          <p>Take your pick:</p>

          <div className={Style.stats}>
            <h2 className="text-sm">Proposals</h2>
            <div className="overflow-hidden border-gray-300 py-6">
            <table className="min-w-full divide-y divide-gray-300 border-b">
                <thead>
                    <tr>
                        <th scope="col" className={classes.th}>#</th>
                        <th scope="col" className={classes.th}>Name</th>
                        <th scope="col" className={classes.th}>Votes</th>
                    </tr>
                </thead>

                <tbody className="divide-y divide-gray-300 border-b">
                    {/* {props.candidates.map(({ id, name, voteCount }) => (
                        <tr key={id}>
                            <td className={classes.td}>{id}</td>
                            <td className={classes.td}>{name}</td>
                            <td className={classes.td}>{voteCount}</td>
                        </tr>
                    ))} */}
                </tbody>
            </table>
        </div>
          </div>
          <br></br>
          <div><CountdownTimer/></div>
        </div>

        <div className={Style.stats_container}>
          <div className={Style.stats}>
            <div className={Style.header}>
              <h2>Vote</h2>
              {/* <p>$10</p> */}
              {/* <p>{ticketPrice && ticketPrice.toString()}</p> */}

              {/* {" "} {currency} */}
            </div>

            <div>
              <h3 className="my-4 text-left text-xl md:text-xl text-white font-bold leading-tight">
                Select Candidate
              </h3>
              <form noValidate onSubmit={handleSubmit}>
                {/* <select
                  onChange={handleSelect}
                  className="px-6 py-3 bg-transparent rounded w-full border focus:outline-none"
                >
                  {props.candidates.map(({ id, name }) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </select> */}
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 my-6 rounded"
                >
                  Vote
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default voting;
