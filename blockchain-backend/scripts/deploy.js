const main = async () => {
    const gameContractFactory = await hre.ethers.getContractFactory('MyEpicGame');
    const gameContract = await gameContractFactory.deploy(
        ["SpiderMan", "DrStrange", "IronMan"],       // Names
        ["https://www.nationalworld.com/webimg/QVNIMTIzNzg5MTAz.jpg", // Images
            "https://static.wikia.nocookie.net/marveldatabase/images/6/67/Stephen_Strange_%28Earth-199999%29_from_Spider-Man_No_Way_Home_Promo_001.jpg/revision/latest?cb=20211216172929",
            "https://cdn.britannica.com/49/182849-050-4C7FE34F/scene-Iron-Man.jpg"
        ],
        [100, 200, 300],                    // HP values
        [100, 50, 25],
        "Thanos",
        "https://static.toiimg.com/photo/msid-75390440/75390440.jpg?344550",
        10000,
        50);
    await gameContract.deployed();
    console.log("Contract deployed to:", gameContract.address);

    console.log("Done deploying and minting!");

};

const runMain = async () => {
    try {
        await main();
        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

runMain();