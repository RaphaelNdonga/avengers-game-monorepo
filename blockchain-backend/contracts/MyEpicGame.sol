// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
// NFT contract to inherit from.
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

// Helper functions OpenZeppelin provides.
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import "@openzeppelin/contracts/utils/Base64.sol";

contract MyEpicGame is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct CharacterAttributes {
        uint256 characterIndex;
        string name;
        string imageURI;
        uint256 hp;
        uint256 maxHp;
        uint256 attackDamage;
    }

    struct BigBoss {
        string name;
        string imageURI;
        uint256 hp;
        uint256 maxHp;
        uint256 attackDamage;
    }

    CharacterAttributes[] defaultCharacters;

    BigBoss public bigBoss;

    mapping(uint256 => CharacterAttributes) public nftHolderAttributes;

    mapping(address => uint256) public nftHolders;

    event CharacterNFTMinted(
        address sender,
        uint256 tokenId,
        uint256 characterIndex
    );
    event AttackComplete(uint256 newPlayerHp, uint256 newBossHp);

    // Data passed in to the contract when it's first created initializing the characters.
    // We're going to actually pass these values in from run.js.
    constructor(
        string[] memory characterNames,
        string[] memory characterImageURIs,
        uint256[] memory characterHp,
        uint256[] memory characterAttackDmg,
        string memory bossName,
        string memory bossImage,
        uint256 bossHp,
        uint256 bossAttackDmg
    ) ERC721("Heroes", "HERO") {
        // Loop through all the characters, and save their values in our contract so
        // we can use them later when we mint our NFTs.

        bigBoss = BigBoss({
            name: bossName,
            imageURI: bossImage,
            hp: bossHp,
            maxHp: bossHp,
            attackDamage: bossAttackDmg
        });
        for (uint256 i = 0; i < characterNames.length; i += 1) {
            defaultCharacters.push(
                CharacterAttributes({
                    characterIndex: i,
                    name: characterNames[i],
                    imageURI: characterImageURIs[i],
                    hp: characterHp[i],
                    maxHp: characterHp[i],
                    attackDamage: characterAttackDmg[i]
                })
            );

            CharacterAttributes memory c = defaultCharacters[i];
            console.log(
                "Done initializing %s w/ HP %s, img %s",
                c.name,
                c.hp,
                c.imageURI
            );
        }
        _tokenIds.increment();
    }

    function mintCharacterNFT(uint256 _characterIndex) external {
        require(
            _characterIndex < defaultCharacters.length,
            "There is no such character"
        );
        uint256 newItemId = _tokenIds.current();
        _safeMint(msg.sender, newItemId);
        emit CharacterNFTMinted(msg.sender, newItemId, _characterIndex);

        nftHolderAttributes[newItemId] = CharacterAttributes({
            characterIndex: defaultCharacters[_characterIndex].characterIndex,
            name: defaultCharacters[_characterIndex].name,
            imageURI: defaultCharacters[_characterIndex].imageURI,
            hp: defaultCharacters[_characterIndex].hp,
            maxHp: defaultCharacters[_characterIndex].hp,
            attackDamage: defaultCharacters[_characterIndex].attackDamage
        });

        console.log(
            "Minted new nft token Id: %s and character index %s",
            newItemId,
            _characterIndex
        );

        nftHolders[msg.sender] = newItemId;

        _tokenIds.increment();
    }

    function attackBoss() public {
        uint256 nftHolderTokenId = nftHolders[msg.sender];
        CharacterAttributes storage player = nftHolderAttributes[
            nftHolderTokenId
        ];
        console.log(
            "\nPlayer w/ character %s about to attack. Has %s HP and %s AD",
            player.name,
            player.hp,
            player.attackDamage
        );
        console.log(
            "Boss %s has %s HP and %s AD",
            bigBoss.name,
            bigBoss.hp,
            bigBoss.attackDamage
        );
        // Make sure the player has more than 0 HP.
        require(player.hp > 0, "Error: character must have HP to attack boss.");

        // Make sure the boss has more than 0 HP.
        require(bigBoss.hp > 0, "Error: boss must have HP to attack boss.");

        //player attacks boss
        if (bigBoss.hp < player.attackDamage) {
            bigBoss.hp = 0;
        } else {
            bigBoss.hp = bigBoss.hp - player.attackDamage;
        }
        // Allow boss to attack player.
        if (player.hp < bigBoss.attackDamage) {
            player.hp = 0;
        } else {
            player.hp = player.hp - bigBoss.attackDamage;
        }

        emit AttackComplete(player.hp, bigBoss.hp);

        // Console for ease.
        console.log("Player attacked boss. New boss hp: %s", bigBoss.hp);
        console.log("Boss attacked player. New player hp: %s\n", player.hp);
    }

    function checkIfUserHasNFT()
        public
        view
        returns (CharacterAttributes memory)
    {
        uint256 userNFTTokenId = nftHolders[msg.sender];
        if (userNFTTokenId > 0) {
            return nftHolderAttributes[userNFTTokenId];
        } else {
            CharacterAttributes memory emptyStruct;
            return emptyStruct;
        }
    }

    function getDefaultCharacters()
        public
        view
        returns (CharacterAttributes[] memory)
    {
        return defaultCharacters;
    }

    function getBigBoss() public view returns (BigBoss memory) {
        return bigBoss;
    }

    function tokenURI(uint256 _tokenId)
        public
        view
        override
        returns (string memory)
    {
        CharacterAttributes memory currentCharacter = nftHolderAttributes[
            _tokenId
        ];

        string memory strHp = Strings.toString(currentCharacter.hp);
        string memory strMaxHp = Strings.toString(currentCharacter.maxHp);
        string memory strAttackDamage = Strings.toString(
            currentCharacter.attackDamage
        );
        string memory strTokenId = Strings.toString(_tokenId);

        string memory json = Base64.encode(
            abi.encodePacked(
                '{"name": "',
                currentCharacter.name,
                " -- NFT #: ",
                strTokenId,
                '", "description": "This is an NFT that lets people play in the game Metaverse Slayer!", "image": "',
                currentCharacter.imageURI,
                '", "attributes": [ { "trait_type": "Health Points", "value": ',
                strHp,
                ', "max_value":',
                strMaxHp,
                '}, { "trait_type": "Attack Damage", "value": ',
                strAttackDamage,
                "} ]}"
            )
        );

        string memory output = string(
            abi.encodePacked("data:application/json;base64,", json)
        );

        return output;
    }
}
