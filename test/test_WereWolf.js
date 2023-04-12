const _deploy_contracts = require("../migrations/2_deploy_contracts");
const truffleAssert = require("truffle-assertions");
const BigNumber = require("bignumber.js"); // npm install bignumber.js
var assert = require("assert");

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
  });

  it("Seer gets information about werewolf", async () => {
    let temp = await werewolfInstance.seerIdentify({
      from: seerAddress,
      value: 0,
    });

    truffleAssert.eventEmitted(temp, "SeerIdentifiedWerewolf");
  });

  it("Villagers vote", async () => {
    await werewolfInstance.villagerVote(villagerAddress2, {
      from: villagerAddress2,
      value: 0,
    });
    await werewolfInstance.villagerVote(villagerAddress2, {
      from: villagerAddress3,
      value: 0,
    });

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

  it("Game end", async () => {
    // last villager votes werewolf
    let temp = await werewolfInstance.villagerVote(werewolfAddress, {
      from: villagerAddress3,
      value: 0,
    });

    truffleAssert.eventEmitted(temp, "GameEnded");

    // send money
    await werewolfInstance.giveWinningsToNonWerewolfAndResetGame({
      from: accounts[0],
      value: 0,
    });
  });
});
