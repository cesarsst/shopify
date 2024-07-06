// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Store {
    /**
     * State Variables
     */
    address payable public owner;
    uint256 public ethValue = 5000;
    mapping(uint256 => Product) public products;
    mapping(uint256 => bool) public productExists;

    /**
     * Structs
     */
    struct Product {
        uint256 id;
        string name;
        uint256 price;
        uint256 countInStock;
    }

    /**
     * Events
     */
    event ProductAdded(
        uint256 id,
        string name,
        uint256 price,
        uint256 countInStock
    );
    event ProductUpdated(
        uint256 id,
        string name,
        uint256 price,
        uint256 countInStock
    );
    event OwnerUpdated(address newOwner);
    event ProductPurchased(uint256[] id, uint256[] quantity, address buyer);
    event FundsWithdrawn(uint256 amount, address owner);

    /**
     * Modifiers
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }

    constructor() {
        owner = payable(msg.sender);
    }

    /**
     * Functions
     */

    /**
     * @dev Add a new product to the store
     * @param id The ID of the product
     * @param name The name of the product
     * @param price The price of the product
     * @param countInStock The count in stock of the product
     */
    function addProduct(
        uint256 id,
        string memory name,
        uint256 price,
        uint256 countInStock
    ) public onlyOwner {
        require(!productExists[id], "Product with this ID already exists");
        products[id] = Product(id, name, price, countInStock);
        productExists[id] = true;
        emit ProductAdded(id, name, price, countInStock);
    }

    /**
     * @dev Update an existing product in the store
     * @param id The ID of the product
     * @param name The name of the product
     * @param price The price of the product
     * @param countInStock The count in stock of the product
     */
    function updateProduct(
        uint256 id,
        string memory name,
        uint256 price,
        uint256 countInStock
    ) public onlyOwner {
        require(productExists[id], "Product does not exist");
        products[id] = Product(id, name, price, countInStock);
        emit ProductUpdated(id, name, price, countInStock);
    }

    /**
     * @dev Update the list of products in the store
     * @param newProducts The new list of products
     */
    function updateProductsList(
        Product[] calldata newProducts
    ) external onlyOwner {
        require(newProducts.length > 0, "Empty products list");

        for (uint256 i = 0; i < newProducts.length; i++) {
            Product memory product = newProducts[i];
            products[product.id] = product;
            productExists[product.id] = true;
        }
    }

    /**
     * @dev Update the owner of the store
     * @param newOwner The new owner of the store
     */
    function updateOwner(address payable newOwner) public onlyOwner {
        owner = newOwner;
        emit OwnerUpdated(newOwner);
    }

    /**
     * @dev Update the value of ether
     * @param newValue The new value of ether
     * TODO: Maybe use chainlink to get the value of ether in USD or other currency in the future
     */
    function updateEthValue(uint256 newValue) public onlyOwner {
        ethValue = newValue;
    }

    /**
     * @dev Purchase products from the store
     * @param ids The IDs of the products to purchase
     * @param quantities The quantities of the products to purchase
     * @notice The length of the arrays should be the same
     * @notice The order of the arrays should be the same
     * @notice The arrays should contain the IDs of the products to purchase
     * @notice The arrays should contain the quantities of the products to purchase
     */
    function purchaseProducts(
        uint256[] memory ids,
        uint256[] memory quantities
    ) public payable {
        require(
            ids.length == quantities.length,
            "IDs and quantities length mismatch"
        );
        uint256 totalCost = 0;
        for (uint256 i = 0; i < ids.length; i++) {
            uint256 id = ids[i];
            uint256 quantity = quantities[i];
            require(productExists[id], "Product does not exist");
            Product storage product = products[id];
            require(
                product.countInStock >= quantity,
                "Not enough countInStock for product"
            );
            totalCost += product.price * quantity;
            debitProductCountInStock(id, quantity);
        }

        totalCost = totalCost / ethValue; // value in eth ex: 1.44
        totalCost = totalCost * 10 ** 18; // value in wei ex: 1440000000000000000
        require(msg.value >= totalCost, "Not enough ether sent");
        emit ProductPurchased(ids, quantities, msg.sender);
    }

    function debitProductCountInStock(
        uint256 id,
        uint256 quantity
    ) public onlyOwner {
        require(productExists[id], "Product does not exist");
        Product storage product = products[id];
        require(
            product.countInStock >= quantity,
            "Not enough countInStock for product"
        );
        product.countInStock -= quantity;
    }

    /**
     * @dev Withdraw funds from the contract
     */
    function withdrawFunds() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner).transfer(balance);
        emit FundsWithdrawn(balance, owner);
    }
}
