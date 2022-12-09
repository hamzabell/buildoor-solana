import * as web3 from "@solana/web3.js";
import * as token from "@solana/spl-token"
import  { initializeKeypair } from './initializeKeypair';
import * as fs from 'fs';
import {  bundlrStorage, findMetadataPda, keypairIdentity, Metaplex, toMetaplexFile } from '@metaplex-foundation/js';
import {
    DataV2,
    createCreateMetadataAccountV2Instruction
} from '@metaplex-foundation/mpl-token-metadata';


const TOKEN_NAME = "BUILD";
const TOKEN_SYMBOL = "BLD";
const TOKEN_DESCRIPTION = "A token for buildoors";
const TOKEN_IMAGE_NAME = "crypto_sen.jpeg";
const TOKEN_IMAGE_PATH = `tokens/bld/assets/${TOKEN_IMAGE_NAME}`;


async function createBldToken(
    connection: web3.Connection,
    payer: web3.Keypair
) {
    const tokenMint = await token.createMint(
        connection,
        payer,
        payer.publicKey,
        payer.publicKey,
        2
    )

    const metaplex = Metaplex.make(connection)
        .use(keypairIdentity(payer))
        .use(
            bundlrStorage({
                address: "https://devnet.bundlr.network",
                providerUrl: "https://api.devnet.solana.com",
                timeout: 60000,
            })
        );

    const imageBuffer = await fs.readFileSync(TOKEN_IMAGE_PATH);
    const file = toMetaplexFile(imageBuffer, TOKEN_IMAGE_NAME);
    const imageUri = await metaplex.storage().upload(file)

    const { uri } = await metaplex
            .nfts()
            .uploadMetadata({
                name: TOKEN_NAME,
                description: TOKEN_DESCRIPTION,
                image: imageUri
            })
            .run()
    
    const metadataPda = await findMetadataPda(tokenMint)

    const tokenMetadata = {
        name: TOKEN_NAME,
        symbol: TOKEN_SYMBOL,
        uri: uri,
        sellerFeeBasisPoints: 0,
        creators: null,
        collection: null,
        uses: null
    } as DataV2

    const instruction = createCreateMetadataAccountV2Instruction({
        metadata: metadataPda,
        mint: tokenMint,
        mintAuthority: payer.publicKey,
        payer: payer.publicKey,
        updateAuthority: payer.publicKey
        },
        {
            createMetadataAccountArgsV2: {
                data: tokenMetadata,
                isMutable: true
            }
        } 
    )
    
    const transaction = new web3.Transaction()
    transaction.add(instruction);

    const sig = await web3.sendAndConfirmTransaction(
        connection,
        transaction,
        [payer]
    )

    fs.writeFileSync(
        "tokens/bld/cache.json",
        JSON.stringify({
            mint: tokenMint.toBase58(),
            imageUri: imageUri,
            metadataUri: uri,
            tokenMetadata: metadataPda.toBase58(),
            metadataTransaction: sig
        })
    )   


}

async function main() {
    const connection = new web3.Connection(web3.clusterApiUrl("devnet"));
    const payer = await initializeKeypair(connection);

    await createBldToken(connection, payer);
}

main()
    .then(() => {
        console.log("Finsished Successfully");
        process.exit(0)
    })
    .catch ((err) => {
        console.log(err);
        process.exit(1);
    })