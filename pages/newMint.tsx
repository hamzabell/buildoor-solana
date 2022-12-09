import { ArrowForwardIcon } from "@chakra-ui/icons";
import { Button, Container, Heading, HStack, VStack, Text } from "@chakra-ui/react";
import { NextPage } from "next";
import { MouseEventHandler, useCallback, useEffect, useMemo, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js";
import MainLayout from '../components/MainLayout'
interface newMintProps {
    mint: PublicKey;
}


const NewMint: NextPage<any, any> = ({ mint }: { mint: PublicKey }) => {
    const[metadata, setMetadata] = useState<any>();
    const { connection } = useConnection();
    const walletAdapter = useWallet();
    const metaplex = useMemo(() => {
        return Metaplex.make(connection).use(
            walletAdapterIdentity(walletAdapter)
        )
    }, [connection, walletAdapter]);

    useEffect(() => {
        metaplex.nfts().findByMint({ mintAddress: new PublicKey(mint) }).run()
        .then ((nft: any) => {
            fetch(nft.uri)
                .then((res) => res.json())
                .then((metadata) => {
                    console.log(metadata)
                    setMetadata(metadata)
                })
        })
    }, [ mint, metaplex, walletAdapter])
    const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(
        async (event) => {},
        []
    )

    return (
        <MainLayout>
            <VStack>
                <Heading
                    color="white"
                    as="h1"
                    size="3xl"
                    noOfLines={2}
                    textAlign="center"
                >
                    Mint your buildoor. Earn $BLD. Level up.
                </Heading>

                <img src={metadata?.image ?? ""} alt="buildoor image" width={200} height={200} />

                <Button
                    bgColor="accent"
                    color="white"
                    maxW="380px"
                    onClick={handleClick}
                >
                    <HStack>
                        <Text>stake my buildoor</Text>
                        <ArrowForwardIcon />
                    </HStack>
                </Button>
            </VStack>
        </MainLayout>
    )


}


NewMint.getInitialProps = async ({ query }) => {
    const { mint } = query;
    if(!mint) throw { error: "No Mint" };

    try {
        const mintPubKey = new PublicKey(mint);
        return { mint: mintPubKey }
    } catch {
        throw({ error: "Invalid Mint" });
    }
}

export default NewMint;