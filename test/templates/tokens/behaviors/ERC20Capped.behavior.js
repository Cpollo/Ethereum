const shouldFail = require('../../../helpers/shouldFail');
const { ether } = require('../../../helpers/ether');
const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-bignumber')(BigNumber))
  .should();

function shouldBehaveLikeERC20Capped (minter, [anyone], cap) {
  describe('capped token', function () {
    const from = minter;

    it('should start with the correct cap', async function () {
      (await this.token.cap()).should.be.bignumber.equal(cap);
    });

    it('should mint when amount is less than cap', async function () {
      await this.token.mint(anyone, cap.minus(1), { from });
      (await this.token.totalSupply()).should.be.bignumber.equal(cap.minus(1));
    });

    it('should fail to mint if the ammount exceeds the cap', async function () {
      await this.token.mint(anyone, cap.minus(1), { from });
      await shouldFail.reverting(this.token.mint(anyone, ether(100), { from }));
    });

    it('should fail to mint after cap is reached', async function () {
      await this.token.mint(anyone, cap, { from });
      await shouldFail.reverting(this.token.mint(anyone, ether(1), { from }));
    });
  });
}

module.exports = {
  shouldBehaveLikeERC20Capped,
};
