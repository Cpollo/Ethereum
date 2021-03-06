const DevEthWalletMock = artifacts.require('DevEthWalletMock');
const shouldFail = require('../helpers/shouldFail');
const CpolloRole = artifacts.require('CpolloRole');
const DevRole = artifacts.require('DevRole');
const BigNumber = web3.BigNumber;
const time = require('../helpers/time');
const { ether } = require('../helpers/ether');
const {  shouldBehaveLikeCpolloWallet } = require('./CpolloBehavior');
const {  shouldBehaveLikeManagerWallet } = require('./WalletManagerBehavior');


require('chai')
  .use(require('chai-bignumber')(BigNumber))
  .should();


contract('DevEthWallet', function ([_, cpollo , dev, notDev, teamWallet, walletManager, notWalletManager, ...otherAccounts]) {
  const amountLimit = 100;
  const  amount = ether(500); 
  beforeEach(async function () {
    this.cpolloContract = await CpolloRole.new({ from: cpollo });
    this.devContract = await DevRole.new(this.cpolloContract.address, { from: cpollo });
    await this.devContract.addDev(dev, { from: cpollo });
    
    // One month
    const timeStampInterval = (await time.latest()) + time.duration.weeks(4);
    this.contract = await DevEthWalletMock.new(
                            this.devContract.address,                  
                            ether(amountLimit),
                            timeStampInterval,  
                            teamWallet,
                            this.cpolloContract.address, 
                            walletManager,
                            { from: cpollo, value: amount});
  });
 

  shouldBehaveLikeCpolloWallet (cpollo, teamWallet, amount);
  shouldBehaveLikeManagerWallet(dev, notDev, walletManager, notWalletManager, amountLimit);

  describe('Eth Wallet Behavior', function () {
    context('Cpollo features', function () {
      it('get correct amount transfered', async function () {        
        (await web3.eth.getBalance(this.contract.address)).should.be.bignumber.equal(amount);
      });
      it('null funds in contract address when scam is noticed', async function () {
        await this.contract.scamAlert({ from:cpollo }); 
        (await web3.eth.getBalance(this.contract.address)).should.be.bignumber.equal(0);         
      });

      it('returns funds to refund wallet when scam happened', async function () {
        const teamWalletBalance = await web3.eth.getBalance(teamWallet);
        await this.contract.scamAlert({ from:cpollo });         
        (await web3.eth.getBalance(teamWallet)).should.be.bignumber.equal(teamWalletBalance.plus(amount));
      });
      });
    
    });
  
});