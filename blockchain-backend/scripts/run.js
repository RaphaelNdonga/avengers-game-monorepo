const main = async () => {
    const contractFactory = await hre.ethers.getContractFactory("MyEpicGame");
    const myEpicGame = await contractFactory.deploy(
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
    await myEpicGame.deployed();
    console.log("Contract deployed to: ", myEpicGame.address);

    let txn = await myEpicGame.mintCharacterNFT(2);
    await txn.wait();

    txn = await myEpicGame.attackBoss();
    await txn.wait();

    let returnedTokenURI = await myEpicGame.tokenURI(1);
    console.log("Token URI: ", returnedTokenURI);
}

const runMain = async () => {
    try {
        await main();
        process.exit(0);
    } catch (error) {
        console.log("error! ", error);
        process.exit(1);
    }
}

runMain();