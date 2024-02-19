// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Cryptazon {
    address public owner;

    // Structures
    struct Item {
        uint256 id;
        string name;
        string category;
        string image;
        uint256 cost;
        uint256 rating;
        uint256 stock;
    }
    struct Order {
        uint256 time;
        Item item;
    }

    // Mappings
    mapping(uint256 => Item) public items;
    mapping(address => uint256) public orderCount;
    mapping(address => mapping(uint256 => Order)) public orders;

    // Events
    event List(string name, uint256 cost, uint256 quantity);
    event Buy(address buyer, uint256 orderId, uint256 itemId);

    // Modifier - Only Owner can List
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    // Constructor
    constructor() {
        owner = msg.sender;
    }

    // List Products
    function list(
        uint256 _id,
        string memory _name,
        string memory _category,
        string memory _image,
        uint256 _cost,
        uint256 _rating,
        uint256 _stock
    ) public onlyOwner {

        // Create Item Structure
        Item memory item = Item(_id, _name, _category, _image, _cost, _rating, _stock);

        // Save Item Structure to Blockchain
        items[_id] = item;

        // Trigger Event
        emit List(_name, _cost, _stock);
    }


    // Purchase Products
    function buy(uint256 _id) public payable {

        // Fetch Item
        Item memory item = items[_id];

        // Require Enough Funds to Buy Item
        require(msg.value >= item.cost);

        // Require Item is in Stock
        require(item.stock > 0);

        // Create Order
        Order memory order = Order(block.timestamp, item);

        // Add Order for User
        orderCount[msg.sender]++; // <-- Order ID
        orders[msg.sender][orderCount[msg.sender]] = order;

        // Subtract Stock
        items[_id].stock = item.stock - 1;

        // Trigger Event
        emit Buy(msg.sender, orderCount[msg.sender], item.id);
    }


    // Withdraw Funds
    function withdraw() public onlyOwner {
        (bool success, ) = owner.call{ value: address(this).balance }("");
        require(success);
    }














}
