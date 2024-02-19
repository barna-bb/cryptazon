/* eslint-disable no-undef */

const { expect } = require("chai");

// Convert ETHER to WEI?
const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether');
}

// Global Constants for Listing an Item
const ID = 1;
const NAME = "Shoes";
const CATEGORY = "Clothing";
const IMAGE = "ipfs_url";
const COST = tokens(1);
const RATING = 4;
const STOCK = 5;

describe("Cryptazon", () => {

  let cryptazon;
  let deployer, buyer;

  beforeEach(async () => {

    // Setup Accounts
    [deployer, buyer] = await ethers.getSigners();

    // Deploy Contract
    const Cryptazon = await ethers.getContractFactory("Cryptazon");
    cryptazon = await Cryptazon.deploy();
  });

  // Deployment
  describe("Deployment", () => {
    it("Sets the owner", async () => {
      expect(await cryptazon.owner()).to.equal(deployer.address);
    });
  });

  // Listing
  describe("Listing", () => {

    let transaction;

    beforeEach(async () => {
      // Calling list function
      transaction = await cryptazon.connect(deployer).list(
        ID,
        NAME,
        CATEGORY,
        IMAGE,
        COST,
        RATING,
        STOCK
      );
      await transaction.wait();
    });

    it("Returns item attributes", async () => {
      // Fetch items
      const item = await cryptazon.items(ID);
      expect(item.id).to.equal(ID);
      expect(item.name).to.equal(NAME);
      expect(item.category).to.equal(CATEGORY);
      expect(item.image).to.equal(IMAGE);
      expect(item.cost).to.equal(COST);
      expect(item.rating).to.equal(RATING);
      expect(item.stock).to.equal(STOCK);
    });

    it("Emits List event", () => {
      expect(transaction).to.emit(cryptazon, "List");
    });
  });

  // Buying
  describe("Buying", () => {

    let transaction;

    beforeEach(async () => {
      // Calling list function
      transaction = await cryptazon.connect(deployer).list(
        ID,
        NAME,
        CATEGORY,
        IMAGE,
        COST,
        RATING,
        STOCK
      );
      await transaction.wait();

      // Buying Item
      transaction = await cryptazon.connect(buyer).buy(ID, { value: COST });
    });

    it("Updates buyer's order count", async () => {
      const result = await cryptazon.orderCount(buyer.address);
      expect(result).to.equal(1);
    });

    it("Adds the order", async () => {
      const order = await cryptazon.orders(buyer.address, 1);
      expect(order.time).to.be.greaterThan(0);
      expect(order.item.name).to.equal(NAME);
    });

    it("Updates contract balance", async () => {
      const result = await ethers.provider.getBalance(cryptazon.address);
      expect(result).to.equal(COST);
    });

    it("Emits Buy event", () => {
      expect(transaction).to.emit(cryptazon, "Buy");
    });
  });

  // Withdraw
  describe("Withdraw", () => {

    let balanceBefore;

    beforeEach(async () => {
      // Calling list function
      let transaction = await cryptazon.connect(deployer).list(
        ID,
        NAME,
        CATEGORY,
        IMAGE,
        COST,
        RATING,
        STOCK
      );
      await transaction.wait();

      // Buying Item
      transaction = await cryptazon.connect(buyer).buy(ID, { value: COST });
      await transaction.wait();

      // Get Deployer Balance Before
      balanceBefore = await ethers.provider.getBalance(deployer.address);

      // Withdraw
      transaction = await cryptazon.connect(deployer).withdraw();
      await transaction.wait();
    });

    it("Updates the owner balance", async () => {
      const balanceAfter = await ethers.provider.getBalance(deployer.address);
      expect(balanceAfter).to.be.greaterThan(balanceBefore);
    });

    it("Updates the contract balance", async () => {
      const result = await ethers.provider.getBalance(cryptazon.address);
      expect(result).to.equal(0);
    });
  });
});
