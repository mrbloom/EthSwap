const Token = artifacts.require("Token");
const EthSwap = artifacts.require("EthSwap");

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
function tokens(n) {
  return web3.utils.toWei(n, "ether");
}

const getBalance = async (address) => await web3.eth.getBalance(address);

contract("EthSwap", function ([deployer, investor]) {
  (async () => {
    let d = await getBalance(deployer);
    let i = await getBalance(investor);
    console.log(d, i);
  })();

  let ethSwap, token;
  before("should setup the contract instance", async () => {
    token = await Token.new();
    ethSwap = await EthSwap.new(token.address);

    await token.transfer(ethSwap.address, tokens("1000000"));
  });

  it("EthSwap has name", async function () {
    const name = await ethSwap.name();
    assert.equal(name, "EthSwap Change");
  });

  it("Token has name", async function () {
    const name = await token.name();
    assert.equal(name, "DApp Token");
  });

  it("contract has tokens", async () => {
    let balance = await token.balanceOf(ethSwap.address);
    assert.equal(balance.toString(), tokens("1000000"));
  });

  describe("buytokens()", async () => {
    let result;
    before(async () => {
      result = await ethSwap.buytokens({ from: investor, value: tokens("1") });
    });

    it("buy tokens", async () => {
      let investorBalance = await token.balanceOf(investor);
      assert.equal(investorBalance.toString(), tokens("100"));
      let ethSwapBalance = await token.balanceOf(ethSwap.address);
      assert.equal(ethSwapBalance.toString(), tokens("999900"));
      let ethSwapBalanceEth = await web3.eth.getBalance(ethSwap.address);
      assert.equal(
        ethSwapBalanceEth.toString(),
        web3.utils.toWei("1", "Ether")
      );
      const e = result.logs[0].args;
      assert.equal(e.account, investor);
      assert.equal(e.token, token.address);
      assert.equal(e.amount.toString(), tokens("100").toString());
      assert.equal(e.rate.toString(), "100");
    });
  });
});
