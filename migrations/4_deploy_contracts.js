const ERC721 = artifacts.require("ERC721");
const Marketplace = artifacts.require("Marketplace");

module.exports = (deployer, network, accounts) => {
    deployer.deploy(ERC721,"Metaverse Tokens", "METT").then(function() {
      return deployer.deploy(Marketplace);
    });
};