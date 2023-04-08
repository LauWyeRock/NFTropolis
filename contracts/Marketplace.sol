// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import "hardhat/console.sol";

contract Marketplace is ERC721URIStorage, ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    Counters.Counter private _itemsSold;
    uint256 public listingCounter = 0; //////////// Auction
    
    uint8 public constant STATUS_OPEN = 1; /////////// Auction
    uint8 public constant STATUS_DONE = 2; /////////////// Auction
    uint256 public minAuctionIncrement = 10; ////////////////// Auction

    bool public contractStopped = false; //// Emergency Stop

    uint256 listingPrice = 0.025 ether;
    address payable owner;
    
    mapping(uint256 => bool) public insuredTokens; ////////// Insurance
    mapping(uint256 => uint256) public insuredAmounts; /////////// Insurance

    uint256 public totalInsuredAmount; ////////// Insurance
    uint256 public premium = 0.00001 ether; ////////////// Insurance

    mapping(uint256 => MarketItem) private idToMarketItem;

    mapping(uint256 => Listing) public listings; ////////////////// Auction
    mapping(uint256 => mapping(address => uint256)) public bids; ////////////////// Auction
    mapping(uint256 => address) public highestBidder; ////////////////// Auction


    // Isowner modifier
    // IsBidValid modifier
    // isAuctionEnded modifier
    // isAuctionNotEnded modifier
    // isAuctionWinner modifier
    // isAuctionNFTSeller modifier
    // isAuctionBidded modifier
    // isAuctionNotBidded modifier


    // Events

    struct Listing { ///////////// Auction
        address seller;
        uint256 tokenId;
        uint256 price; // display price
        uint256 netPrice; // actual price
        uint256 startAt;
        uint256 endAt; 
        uint8 status;
    }

    struct MarketItem {
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }

    event MarketItemCreated(
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );

    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "only owner of the marketplace can change the listing price"
        );
        _;
    }

    modifier haltInEmergency() { ////Emergency Stop
        if (!contractStopped) _;
    }

    modifier enableInEmergency() { ////Emergency Stop
        if (contractStopped) _;
    }

    function toggleContractStopped() public onlyOwner { ////Emergency Stop
        contractStopped = !contractStopped;
    }
 
    constructor() ERC721("Metaverse Tokens", "METT") {
        owner = payable(msg.sender);
    }

    /* Updates the listing price of the contract */
    function updateListingPrice(uint256 _listingPrice)
        public
        payable
        onlyOwner
    {
        require(
            owner == msg.sender,
            "Only marketplace owner can update listing price."
        );
        listingPrice = _listingPrice;
    }

    /* Returns the listing price of the contract */
    function getListingPrice() public view returns (uint256) {
        return listingPrice;
    }

    /* Mints a token and lists it in the marketplace */
    function createToken(string memory tokenURI, uint256 price)
        public
        payable
        returns (uint256)
    {   
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        createMarketItem(newTokenId, price);
        insuredTokens[newTokenId] = false;
        insuredTokens[newTokenId] = false;
        return newTokenId;
    }

    // Get temp highest bid
    // get temp highest bidder
    // get initial price of auction
    // get seller of nft

    function createAuctionListing (uint256 price, uint256 tokenId, uint256 durationInSeconds) public returns (uint256) { /////////// AUCTION
        listingCounter++;
        uint256 listingId = listingCounter;

        uint256 startAt = block.timestamp;
        uint256 endAt = startAt + durationInSeconds;

        listings[tokenId] = Listing({
            seller: msg.sender,
            tokenId: tokenId,
            price: price,
            netPrice: price,
            status: STATUS_OPEN,
            startAt: startAt,
            endAt: endAt
        });
        // _transfer(msg.sender, address(this), tokenId);
        return listingId;
    }

    function isAuctionOpen(uint256 id) public view returns (bool) { ///////////// AUCTION
        return
            listings[id].status == STATUS_OPEN &&
            listings[id].endAt > block.timestamp;
    }

    function isAuctionExpired(uint256 id) public view returns (bool) { //////////// AUCTION
        return listings[id].endAt <= block.timestamp;
    }

    function _transferFund(address payable to, uint256 amount) internal { /////////// AUCTION
        if (amount == 0) {
            return;
        }
        require(to != address(0), 'Error, cannot transfer to address(0)');

        (bool transferSent, ) = to.call{value: amount}("");
        require(transferSent, "Error, failed to send Ether");
    }

    function bid(uint256 listingId) public payable nonReentrant { //////////// AUCTION
        require(isAuctionOpen(listingId), 'auction has ended');
        Listing storage listing = listings[listingId];
        require(msg.sender != listing.seller, "cannot bid on what you own");

        uint256 newBid = bids[listingId][msg.sender] + msg.value;
        require(newBid >= listing.price, "cannot bid below the latest bidding price");

        bids[listingId][msg.sender] += msg.value;
        highestBidder[listingId] = msg.sender;

        uint256 incentive = listing.price / minAuctionIncrement;
        listing.price = listing.price + incentive;

    }

    function completeAuction(uint256 listingId) public payable nonReentrant { ////////////// AUCTION
        require(!isAuctionOpen(listingId), 'auction is still open');

        Listing storage listing = listings[listingId];
        address winner = highestBidder[listingId]; 
        require(
            msg.sender == listing.seller || msg.sender == winner, 
            'only seller or winner can complete auction'
        );

        if(winner != address(0)) {
           _transfer(address(this), winner, listing.tokenId);

            uint256 amount = bids[listingId][winner]; 
            bids[listingId][winner] = 0;
            _transferFund(payable(listing.seller), amount);

        } else {
            _transfer(address(this), listing.seller, listing.tokenId);
        }

        listing.status = STATUS_DONE;

    }

    function getPremium() public view returns (uint256) {
        return premium;
    }

    function insureToken(uint256 tokenId) external payable {
        require(msg.sender == idToMarketItem[tokenId].seller, "Only the owner can insure tokens");
        require(!insuredTokens[tokenId], "Token is already insured");
        
        uint256 tokenValue = idToMarketItem[tokenId].price;
        require(msg.value >= premium, "Premium not paid");
        insuredTokens[tokenId] = true;
        insuredAmounts[tokenId] += tokenValue;
        totalInsuredAmount += tokenValue;
    }
    
    function claimInsurance(uint256 tokenId) external {
        require(insuredTokens[tokenId], "Token is not insured");
        require(msg.sender == idToMarketItem[tokenId].seller, "Only owner of token can claim");
        
        uint256 tokenValue = idToMarketItem[tokenId].price;
        uint256 payout = tokenValue * (insuredAmounts[tokenId] / totalInsuredAmount);
        insuredAmounts[tokenId] -= tokenValue;
        totalInsuredAmount -= tokenValue;
        insuredTokens[tokenId] = false;
        payable(msg.sender).transfer(payout);
    }

    function createMarketItem(uint256 tokenId, uint256 price) private {
        require(price > 0, "Price must be at least 1 wei");
        require(
            msg.value == listingPrice,
            "Price must be equal to listing price"
        );

        idToMarketItem[tokenId] = MarketItem(
            tokenId,
            payable(msg.sender),
            payable(address(this)),
            price,
            false
        );

        _transfer(msg.sender, address(this), tokenId);
        emit MarketItemCreated(
            tokenId,
            msg.sender,
            address(this),
            price,
            false
        );
    }

    /* allows someone to resell a token they have purchased */
    function resellToken(uint256 tokenId, uint256 price) public payable {
        require(
            idToMarketItem[tokenId].owner == msg.sender,
            "Only item owner can perform this operation"
        );
        require(
            msg.value == listingPrice,
            "Price must be equal to listing price"
        );
        idToMarketItem[tokenId].sold = false;
        idToMarketItem[tokenId].price = price;
        idToMarketItem[tokenId].seller = payable(msg.sender);
        idToMarketItem[tokenId].owner = payable(address(this));
        _itemsSold.decrement();


        _transfer(msg.sender, address(this), tokenId);
    }

    /* Creates the sale of a marketplace item */
    /* Transfers ownership of the item, as well as funds between parties */
    function createMarketSale(uint256 tokenId) public payable haltInEmergency returns(uint256) {
        uint256 price = idToMarketItem[tokenId].price;
        require(
            msg.value == price,
            "Please submit the asking price in order to complete the purchase"
        );
        idToMarketItem[tokenId].owner = payable(msg.sender);
        idToMarketItem[tokenId].sold = true;
        idToMarketItem[tokenId].seller = payable(address(0));
        _itemsSold.increment();
        uint256 itemSold = _itemsSold.current();

        _transfer(address(this), msg.sender, tokenId);
        payable(owner).transfer(listingPrice);
        payable(idToMarketItem[tokenId].seller).transfer(msg.value);

        return itemSold;
    }

    /* Returns all unsold market items */
    function fetchMarketItems() public view returns (MarketItem[] memory) {
        uint256 itemCount = _tokenIds.current();
        uint256 unsoldItemCount = _tokenIds.current() - _itemsSold.current();
        uint256 currentIndex = 0;

        MarketItem[] memory items = new MarketItem[](unsoldItemCount);
        for (uint256 i = 0; i < itemCount; i++) {
            if (idToMarketItem[i + 1].owner == address(this)) {
                uint256 currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    /* Returns only items that a user has purchased */
    function fetchMyNFTs() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _tokenIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender) {
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender) {
                uint256 currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    /* Returns only items a user has listed */
    function fetchItemsListed() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _tokenIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].seller == msg.sender) {
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].seller == msg.sender) {
                uint256 currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    function getOwner(uint256 tokenId) public view returns(address){
            return idToMarketItem[tokenId].owner;
        }

    function destroyAndSend(address payable recipient) public onlyOwner {
        selfdestruct(recipient);
    }


}