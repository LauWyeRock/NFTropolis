require("@nomicfoundation/hardhat-toolbox");

const NEXT_PUBLIC_POLYGON_MUMBAI_RPC = "https://polygon-mumbai.g.alchemy.com/v2/O3kCCuCNKae145765zyl0DANkC4L8zaF";
const NEXT_PUBLIC_PRIVATE_KEY = "a30c5725940d06641e1fa7af2397834c1e9561d9b9827dde466513f56881dd7c";
/** @type import('hardhat/config').HardhatUserConfig */

module.exports = {
  solidity: "0.8.17",
  defaultNetwork: "polygon_mumbai",
  networks: {
    hardhat: {},
    polygon_mumbai: {
      url: NEXT_PUBLIC_POLYGON_MUMBAI_RPC,
      accounts: [`0x${NEXT_PUBLIC_PRIVATE_KEY}`],
    },
  },
};
