const main = async () => {
    const gameContractFactory = await hre.ethers.getContractFactory('MyEpicGame');
    const gameContract = await gameContractFactory.deploy(
        ["SpiderMan", "DrStrange", "IronMan"],       // Names
        ["https://www.nationalworld.com/webimg/QVNIMTIzNzg5MTAz.jpg", // Images
            "https://www.cnet.com/a/img/resize/41e73c5ac49a7b175534bcd57d6b46c4776472dc/2016/10/28/3809e66e-d3fe-46bb-963a-705d88f5a902/doctor-strange6.jpg?auto=webp",
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
    storeContractData(gameContract, "MyEpicGame");

    console.log("Done deploying and minting!");

};

function storeContractData(contract, contractName) {
    const fs = require("fs");
    const contractsDir = __dirname + "/../../frontend/src/utils";

    if (!fs.existsSync(contractsDir)) {
        fs.mkdirSync(contractsDir);
    }

    fs.writeFileSync(
        contractsDir + `/${contractName}-address.json`,
        JSON.stringify({ Address: contract.address }, undefined, 2)
    );

    const contractArtifact = artifacts.readArtifactSync(contractName);

    fs.writeFileSync(
        contractsDir + `/${contractName}.json`,
        JSON.stringify(contractArtifact, null, 2)
    );
}

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