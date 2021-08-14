import { Button, Dropdown, Menu } from "antd";
import { ButtonProps } from "antd/lib/button";
import { createUninitializedMint, createTokenAccount } from "../../actions/account"
import { AccountLayout, MintLayout, Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import type AuthorityType from "@solana/spl-token";
import React, { useCallback } from "react";
import { LABELS } from "../../constants";
import { useWallet, WalletAdapter } from "../../contexts/wallet";
import { sendTransaction, useConnection } from "../../contexts/connection";
import { Account, Connection, Transaction, TransactionInstruction, TransactionCtorFields, PublicKey, sendAndConfirmTransaction } from "@solana/web3.js";
// import { transfer } from "@project-serum/serum/lib/token-instructions";
import { SystemProgram, TransferParams} from "@solana/web3.js";
import { publicKey } from "../../utils/layout";
import { Row } from "antd";
import { notify } from "../../utils/notifications";

export interface ConnectButtonProps
  extends ButtonProps,
  React.RefAttributes<HTMLElement> {
  allowWalletChange?: boolean;
}

const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID: PublicKey = new PublicKey(
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
);

export const ConnectButton = (props: ConnectButtonProps) => {
  const { wallet, connected, connect, select, provider } = useWallet();
  const { onClick, children, disabled, allowWalletChange, ...rest } = props;

  var connection = useConnection();

  var programId = new PublicKey("5Ds6QvdZAqwVozdu2i6qzjXm8tmBttV6uHNg4YU8rB1P");

  const menu = (
    <Menu>
      <Menu.Item key="3" onClick={select}>
        Change Wallet
      </Menu.Item>
    </Menu>
  );
  return (
    <Dropdown.Button
      onClick={connect}
      disabled={connected && disabled}
      overlay={menu}
    >
      {LABELS.CONNECT_LABEL}
    </Dropdown.Button>
  );
};
