import { FC } from 'react';
import styles from '../styles/Home.module.css';
import { HStack, Spacer } from '@chakra-ui/react';
import dynamic  from 'next/dynamic';

const WalletMultiButtonDynamic = dynamic(
    async () => (await (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton),
    { ssr: false }
)

const NavBar: FC = () => {
    return (
        <HStack>
            <Spacer />
            <WalletMultiButtonDynamic className={styles["wallet-adapter-button-trigger"]}/>
        </HStack>
    )
}

export default NavBar;