const _deploy_contracts = require("../migrations/2_deploy_contracts");
const truffleAssert = require("truffle-assertions");
const BigNumber = require("bignumber.js"); // npm install bignumber.js
var assert = require("assert");
const {ADDRGETNETWORKPARAMS} = require("dns");

const oneHundredthEth = new BigNumber(1000000000000000000).dividedBy(100); // 0.01 eth

var Werewolf = artifacts.require("../contracts/Werewolf.sol");

contract("Werewolf", function (accounts) {
  before(async () => {
    werewolfInstance = await Werewolf.deployed();
  });

  console.log("Testing Werewolf contract");

  it("Player fails to join game without paying eth", async () => {
    // player not added
    await truffleAssert.reverts(
      werewolfInstance.joinGame({
        from: accounts[1],
        value: 0,
      })
    );
  });

  it("Player joins game", async () => {
    // player added
    await truffleAssert.passes(
      werewolfInstance.joinGame({
        from: accounts[1],
        value: oneHundredthEth,
      })
    );

    // truffleAssert.eventEmitted(temp, "PlayerJoined");
    // assert.equal(werewolfInstance.playerList.length, 1, "player not added");
  });

  it("4 players join the game, fail to start game", async () => {
    await werewolfInstance.joinGame({
      from: accounts[2],
      value: oneHundredthEth,
    });
    await werewolfInstance.joinGame({
      from: accounts[3],
      value: oneHundredthEth,
    });
    await werewolfInstance.joinGame({
      from: accounts[4],
      value: oneHundredthEth,
    });

    await truffleAssert.reverts(
      werewolfInstance.startGame({
        from: accounts[1],
        value: 0,
      })
    );
  });

  var werewolfAddress;
  var seerAddress;
  var villagerAddress1;
  var villagerAddress2;
  var villagerAddress3;

  it("5 players join the game, game starts", async () => {
    await werewolfInstance.joinGame({
      from: accounts[5],
      value: oneHundredthEth,
    });

    let temp = await werewolfInstance.startGame({
      from: accounts[1],
      value: 0,
    });

    truffleAssert.eventEmitted(temp, "GameStarted");

    // check all roles correct
    // left 1 werewolf, 1 seer, 3 villager
    var werewolfCount = 0;
    var seerCount = 0;
    var villagerCount = 0;

    for (let i = 1; i < 6; i++) {
      let player = accounts[i];

      var truth = await werewolfInstance.isPlayerWerewolf(player, {
        from: accounts[0],
        value: 0,
      });
      if (truth) {
        werewolfCount += 1;
        werewolfAddress = player;
      }

      truth = await werewolfInstance.isPlayerSeer(player, {
        from: accounts[0],
        value: 0,
      });
      if (truth) {
        seerCount += 1;
        seerAddress = player;
      }
      truth = await werewolfInstance.isPlayerVillager(player, {
        from: accounts[0],
        value: 0,
      });
      if (truth) {
        villagerCount += 1;
        if (villagerCount == 1) {
          villagerAddress1 = player;
        } else if (villagerCount == 2) {
          villagerAddress2 = player;
        } else if (villagerCount == 3) {
          villagerAddress3 = player;
        }
      }
    }
    console.log("----------------");
    console.log(werewolfCount);
    console.log(seerCount);
    console.log(villagerCount);
    console.log("----------------");
    console.log(werewolfAddress);
    console.log(
      await werewolfInstance.isPlayerWerewolf(werewolfAddress, {
        from: accounts[0],
        value: 0,
      })
    );
    console.log(seerAddress);
    console.log(
      await werewolfInstance.isPlayerSeer(seerAddress, {
        from: accounts[0],
        value: 0,
      })
    );
    console.log(villagerAddress1);
    console.log(
      await werewolfInstance.isPlayerVillager(villagerAddress1, {
        from: accounts[0],
        value: 0,
      })
    );
    console.log(villagerAddress2);
    console.log(
      await werewolfInstance.isPlayerVillager(villagerAddress2, {
        from: accounts[0],
        value: 0,
      })
    );
    console.log(villagerAddress3);
    console.log(
      await werewolfInstance.isPlayerVillager(villagerAddress3, {
        from: accounts[0],
        value: 0,
      })
    );
    console.log("----------------");

    assert.equal(werewolfCount, 1, "Number of werewolf is wrong");
    assert.equal(seerCount, 1, "Number of seer is wrong");
    assert.equal(villagerCount, 3, "Number of villager is wrong");
  });

  it("Player fails to join game as game is full", async () => {
    // nothing happens
    await truffleAssert.reverts(
      werewolfInstance.joinGame({
        from: accounts[6],
        value: oneHundredthEth,
      })
    );
  });

  it("Werewolf kills a villager", async () => {
    await werewolfInstance.werewolfKill(villagerAddress1, {
      from: werewolfAddress,
      value: 0,
    });

    // villager1 is dead
    // left 1 werewolf, 1 seer, 2 villager
    let truth = await werewolfInstance.isPlayerDead(villagerAddress1, {
      from: werewolfAddress,
      value: 0,
    });
    assert.equal(truth, true);

    console.log("----------------");
    console.log(truth);
    console.log("----------------");

    // stage changes
    // assert.equal(werewolfInstance.stage, werewolfInstance.Stages.DayTime);
  });

  it("Seer gets information about werewolf", async () => {
    let temp = await werewolfInstance.seerIdentify({
      from: seerAddress,
      value: 0,
    });

    truffleAssert.eventEmitted(temp, "SeerIdentifiedWerewolf");
  });

  it("Villagers vote", async () => {
    console.log("----------------");
    console.log(
      BigNumber(await werewolfInstance.getAliveVillagerCount()).toNumber()
    );
    console.log("----------------");

    await werewolfInstance.villagerVote(villagerAddress2, {
      from: villagerAddress2,
      value: 0,
    });
    await werewolfInstance.villagerVote(villagerAddress2, {
      from: villagerAddress3,
      value: 0,
    });

    console.log("---------------- hello");
    console.log(
      BigNumber(await werewolfInstance.getAliveVillagerCount()).toNumber()
    );
    console.log(
      BigNumber(
        await werewolfInstance.getPlayerVotedCount(villagerAddress1)
      ).toNumber()
    );
    console.log(
      BigNumber(
        await werewolfInstance.getPlayerVotedCount(villagerAddress2)
      ).toNumber()
    );
    console.log(
      BigNumber(
        await werewolfInstance.getPlayerVotedCount(villagerAddress3)
      ).toNumber()
    );
    console.log(
      BigNumber(
        await werewolfInstance.getPlayerVotedCount(seerAddress)
      ).toNumber()
    );
    console.log("----------------");
    // villager2 dies
    let truth = await werewolfInstance.isPlayerDead(villagerAddress2, {
      from: werewolfAddress,
      value: 0,
    });
    assert.equal(truth, true);

    // left 1 werewolf, 1 seer, 1 villager
  });

  it("Dead villager fails to vote", async () => {
    // nothing happens
    await truffleAssert.reverts(
      werewolfInstance.villagerVote(villagerAddress3, {
        from: villagerAddress2,
        value: 0,
      })
    );
  });

  it("Werewolf cant kill a dead player", async () => {
    // nothing happens
    await truffleAssert.reverts(
      werewolfInstance.werewolfKill(villagerAddress1, {
        from: werewolfAddress,
        value: 0,
      })
    );
  });

  it("Werewolf kills seer", async () => {
    await werewolfInstance.werewolfKill(seerAddress, {
      from: werewolfAddress,
      value: 0,
    });

    // check seer dead
    let truth = await werewolfInstance.isPlayerDead(seerAddress, {
      from: accounts[0],
      value: 0,
    });
    assert.equal(truth, true);

    // left 1 werewolf, 1 villager
  });

  it("Game where villagers win", async () => {
    // get account balance before Winning
    let villager1BalanceBeforeWinning = await web3.eth.getBalance(
      villagerAddress1
    );

    let villager2BalanceBeforeWinning = await web3.eth.getBalance(
      villagerAddress2
    );

    let villager3BalanceBeforeWinning = await web3.eth.getBalance(
      villagerAddress3
    );

    let seerBalanceBeforeWinning = await web3.eth.getBalance(seerAddress);

    let werewolfBalanceBeforeWinning = await web3.eth.getBalance(seerAddress);

    let truth = await werewolfInstance.isPlayerVillager(villagerAddress3, {
      from: accounts[0],
      value: 0,
    });

    console.log("----------");
    console.log("is villager", truth);
    console.log("----------");

    // last villager votes werewolf
    let temp = await werewolfInstance.villagerVote(werewolfAddress, {
      from: villagerAddress3,
      value: 0,
    });

    truffleAssert.eventEmitted(temp, "GameEnded");

    // get account balance After Winning
    let villager1BalanceAfterWinning = await web3.eth.getBalance(
      villagerAddress1
    );

    let villager2BalanceAfterWinning = await web3.eth.getBalance(
      villagerAddress2
    );

    let villager3BalanceAfterWinning = await web3.eth.getBalance(
      villagerAddress3
    );

    let seerBalanceAfterWinning = await web3.eth.getBalance(seerAddress);

    let werewolfBalanceAfterWinning = await web3.eth.getBalance(seerAddress);

    console.log("----------");
    console.log(oneHundredthEth.dividedBy(4).multipliedBy(5));

    console.log(villager1BalanceBeforeWinning);
    console.log(villager1BalanceAfterWinning);
    console.log(
      villager1BalanceAfterWinning - villager1BalanceBeforeWinning ==
        oneHundredthEth.dividedBy(4).multipliedBy(5)
    );

    console.log(villager2BalanceBeforeWinning);
    console.log(villager2BalanceAfterWinning);
    console.log(
      villager2BalanceAfterWinning - villager2BalanceBeforeWinning ==
        oneHundredthEth.dividedBy(4).multipliedBy(5)
    );

    console.log(villager3BalanceBeforeWinning);
    console.log(villager3BalanceAfterWinning);
    console.log(
      villager3BalanceAfterWinning - villager3BalanceBeforeWinning ==
        oneHundredthEth.dividedBy(4).multipliedBy(5)
    );

    console.log(seerBalanceBeforeWinning);
    console.log(seerBalanceAfterWinning);
    console.log(
      seerBalanceAfterWinning - seerBalanceBeforeWinning ==
        oneHundredthEth.dividedBy(4).multipliedBy(5)
    );

    console.log(werewolfBalanceBeforeWinning);
    console.log(werewolfBalanceAfterWinning);
    console.log(
      werewolfBalanceAfterWinning - werewolfBalanceBeforeWinning ==
        oneHundredthEth.dividedBy(4).multipliedBy(5)
    );
    console.log("----------");

    // check 0.05/4 ether to all players account except werewolf
    let fairWinnings = web3.utils.toWei("0.0125", "ether");

    assert.equal(
      villager1BalanceAfterWinning - villager1BalanceBeforeWinning,
      fairWinnings,
      "Winnings 1 not transferred"
    );
    assert.equal(
      villager2BalanceAfterWinning - villager2BalanceBeforeWinning,
      fairWinnings,
      "Winnings 2 not transferred"
    );
    assert.equal(
      villager3BalanceAfterWinning - villager3BalanceBeforeWinning,
      fairWinnings,
      "Winnings 3 not transferred"
    );
    assert.equal(
      seerBalanceAfterWinning - seerBalanceBeforeWinning,
      fairWinnings,
      "Winnings seer not transferred"
    );
  });

  // it("Game where werewolf win", async () => {
  //   var werewolfAddress;
  //   var seerAddress;
  //   var villagerAddress1;
  //   var villagerAddress2;
  //   var villagerAddress3;

  //   await werewolfInstance.joinGame({
  //     from: accounts[1],
  //     value: oneHundredthEth,
  //   });
  //   await werewolfInstance.joinGame({
  //     from: accounts[2],
  //     value: oneHundredthEth,
  //   });
  //   await werewolfInstance.joinGame({
  //     from: accounts[3],
  //     value: oneHundredthEth,
  //   });
  //   await werewolfInstance.joinGame({
  //     from: accounts[4],
  //     value: oneHundredthEth,
  //   });
  //   await werewolfInstance.joinGame({
  //     from: accounts[5],
  //     value: oneHundredthEth,
  //   });

  //   // check all roles correct
  //   // left 1 werewolf, 1 seer, 3 villager
  //   var werewolfCount = 0;
  //   var seerCount = 0;
  //   var villagerCount = 0;

  //   for (let i = 1; i < 6; i++) {
  //     let player = accounts[i];

  //     var truth = await werewolfInstance.isPlayerWerewolf(player, {
  //       from: accounts[0],
  //       value: 0,
  //     });
  //     if (truth) {
  //       werewolfCount += 1;
  //       werewolfAddress = player;
  //     }

  //     truth = await werewolfInstance.isPlayerSeer(player, {
  //       from: accounts[0],
  //       value: 0,
  //     });
  //     if (truth) {
  //       seerCount += 1;
  //       seerAddress = player;
  //     }
  //     truth = await werewolfInstance.isPlayerVillager(player, {
  //       from: accounts[0],
  //       value: 0,
  //     });
  //     if (truth) {
  //       villagerCount += 1;
  //       if (villagerCount == 1) {
  //         villagerAddress1 = player;
  //       } else if (villagerCount == 2) {
  //         villagerAddress2 = player;
  //       } else if (villagerCount == 3) {
  //         villagerAddress3 = player;
  //       }
  //     }
  //   }
  //   console.log("hello");
  //   // console.log(await werewolfInstance.getStage());

  //   // werewolf kills villager
  //   // left 1 werewolf, 1 seer, 2 villager
  //   await werewolfInstance.werewolfKill(villagerAddress1, {
  //     from: werewolfAddress,
  //     value: 0,
  //   });

  //   // Villagers have no majority vote, nothing happens
  //   // left 1 werewolf, 1 seer, 2 villager
  //   await werewolfInstance.villagerVote(villagerAddress3, {
  //     from: villagerAddress2,
  //     value: 0,
  //   });
  //   await werewolfInstance.villagerVote(villagerAddress2, {
  //     from: villagerAddress3,
  //     value: 0,
  //   });

  //   console.log("hello2");

  //   // werewolf kills villager
  //   // left 1 werewolf, 1 seer, 1 villager
  //   await werewolfInstance.werewolfKill(villagerAddress2, {
  //     from: werewolfAddress,
  //     value: 0,
  //   });

  //   // last villager vote seer
  //   // left 1 werewolf, 1 villager
  //   await werewolfInstance.villagerVote(seerAddress, {
  //     from: villagerAddress3,
  //     value: 0,
  //   });

  //   console.log("hello3");
  //   console.log(await werewolfInstance.getStage());


  //   // get account balance before Winning
  //   let werewolfBalanceBeforeWinning = new BigNumber(
  //     await web3.eth.getBalance(werewolfAddress)
  //   );

  //   // werewolf kills villager
  //   // left 1 werewolf, werewolf wins
  //   await werewolfInstance.werewolfKill(villagerAddress3, {
  //     from: werewolfAddress,
  //     value: 0,
  //   });

  //   console.log("hello4");


  //   // check 0.05 ether to werewolf
  //   let werewolfBalanceAfterWinning = new BigNumber(
  //     await web3.eth.getBalance(werewolfAddress)
  //   );

  //   truffleAssert.eventEmitted(temp, "GameEnded");

  //   assert.equal(
  //     werewolfBalanceAfterWinning - werewolfBalanceBeforeWinning,
  //     oneHundredthEth.multipliedBy(5),
  //     "Winnings werewolf not transferred"
  //   );
  // });
});
