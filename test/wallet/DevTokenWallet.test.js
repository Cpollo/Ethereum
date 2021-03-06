const DevTokenWalletMock = artifacts.require('DevTokenWalletMock');
const shouldFail = require('../helpers/shouldFail');
const CpolloRole = artifacts.require('CpolloRole');
const DevRole = artifacts.require('DevRole');
const ERC20Mock = artifacts.require('ERC20Mock');
const BigNumber = web3.BigNumber;
const time = require('../helpers/time');
const { ether } = require('../helpers/ether');
const {  shouldBehaveLikeCpolloWallet } = require('./CpolloBehavior');
const {  shouldBehaveLikeManagerWallet } = require('./WalletManagerBehavior');

require('chai')
  .use(require('chai-bignumber')(BigNumber))
  .should();

const tokenSupply = ether(20000000000);
  
const amountLimit = 100;


contract('DevTokenWallet', function ([_, cpollo , dev, notDev, owner, teamWallet, walletManager, notWalletManager, ...otherAccounts]) {
  beforeEach(async function () {
    this.cpolloContract = await CpolloRole.new({ from: cpollo });
    this.devContract = await DevRole.new(this.cpolloContract.address, { from: cpollo });
    await this.devContract.addDev(dev, { from: cpollo });
  
    // One month
    const timeStampInterval = (await time.latest()) + time.duration.weeks(4);
    this.token = await ERC20Mock.new(owner, tokenSupply);
    this.contract = await DevTokenWalletMock.new(
                            this.devContract.address,
                            this.token.address,                        
                            ether(amountLimit),
                            timeStampInterval,  
                            teamWallet,
                            this.cpolloContract.address, 
                            walletManager,
                            { from: cpollo });

    await this.token.transfer(this.contract.address, tokenSupply, { from: owner });
  });

  shouldBehaveLikeCpolloWallet (cpollo, teamWallet, tokenSupply);
  shouldBehaveLikeManagerWallet(dev, notDev, walletManager, notWalletManager, amountLimit);
  describe('Token Wallet Behavior', function () {
    context('Cpollo features', function () {
        it('returns funds to refund wallet when scam happened', async function () {
          await this.contract.scamAlert({ from:cpollo });          
          (await this.token.balanceOf(teamWallet)).should.be.bignumber.equal(tokenSupply);
        });
      });
    
    });  
});