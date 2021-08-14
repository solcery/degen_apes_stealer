import React, { useCallback } from "react";
import { useConnection, sendTransaction} from "../../contexts/connection";
import { useWallet } from "../../contexts/wallet";
import { LAMPORTS_PER_SOL, PublicKey, Account, TransactionInstruction } from "@solana/web3.js";
import { SystemProgram } from "@solana/web3.js";
import { notify } from "../../utils/notifications";
import { ConnectButton } from "./../../components/ConnectButton";
import { LABELS } from "../../constants";
import { AccountLayout, MintLayout, Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  deserializeUnchecked, BinaryReader, BinaryWriter, serialize
} from 'borsh';
import { apes } from "./apesPack"
import { useParams } from "react-router-dom";

import axios from "axios";

import { Button, Input  } from "antd";

export async function onWalletConnected() {}


export const HomeView = () => {
  // var loaded = false
  const connection = useConnection();
  const { wallet } = useWallet();

  const metaplexProgramId = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

  const systemProgramId = new PublicKey("11111111111111111111111111111111");
  const sysvarRentAccountPublicKey = new PublicKey("SysvarRent111111111111111111111111111111111");
  const tokenProgramId = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
  const associatedTokenProgramId = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');


  type ViewParams = {
    page: string;
  };

  const loadAll = async() => {
    const LIMIT = 20; //Apes on the page
    const ROW_SIZE = 5;
    const ROWS_AMOUNT = LIMIT / ROW_SIZE;

    var table: HTMLTableElement | null = document.getElementById("apes") as HTMLTableElement;
    if (table) {
      if (table.innerHTML != '') {
        return;
      }
      table.innerHTML = ''
      for (let i = 0; i < ROWS_AMOUNT; i++) {
        var row = table.insertRow(i)
        for (let j = 0; j < ROW_SIZE; j++) {
          var apeIndex =  i * ROW_SIZE + j;
          const ape = ''+ apes[apeIndex];
          var arweaveUrl = "https://arweave.net/" + ape
          var response = await axios.get(arweaveUrl) 
          var cell = row.insertCell(j)
          var data = response.data
          var imglink = data.image
          var apeName = data.name
          var img = document.createElement('img') as HTMLImageElement
          img.src = imglink
          img.setAttribute('style', "height:150px;width:150px;"); 
          img.onclick = function() { mintApe(ape); };
          cell.appendChild(img);
        }
      }
    }
  }

  const mintApe = async (ape: string) => {
    if (wallet === undefined) {
      return;
    }
    var publicKey = wallet.publicKey
    if (!publicKey) {
      return;
    }

    console.log(ape)
    var apeUrl = "https://arweave.net/" + ape;
    const response = await axios.get(apeUrl);
    var data = response.data

    var b1: Buffer = Buffer.from([0x04, 0x00, 0x00, 0x00, 0x44, 0x41, 0x50, 0x45, 0x3f, 0x00, 0x00, 0x00]);
    var apeBuffer = Buffer.concat([
      Buffer.from([0x00, 0x0f, 0x00, 0x00, 0x00]),
      Buffer.from(data.name, "utf8"),
      b1,
      Buffer.from("https://arweave.net/" + ape, "utf8"),
      Buffer.from([0x00, 0x00, 0x00, 0x01]),
    ])

    var accounts = [];
    var instructions = []

    var apeMintAccount = new Account();
    accounts.push(apeMintAccount);


    var createMintAccountIx = SystemProgram.createAccount({
      programId: TOKEN_PROGRAM_ID,
      space: 82, // TODO
      lamports: await connection.getMinimumBalanceForRentExemption(82, 'singleGossip'),
      fromPubkey: publicKey,
      newAccountPubkey: apeMintAccount.publicKey,
    });
    instructions.push(createMintAccountIx)

    var createMintIx = Token.createInitMintInstruction(
      TOKEN_PROGRAM_ID,
      apeMintAccount.publicKey,
      0,
      publicKey,
      publicKey,
    );
    instructions.push(createMintIx);

    var associatedAccountPublicKey = await Token.getAssociatedTokenAddress(
      associatedTokenProgramId,
      tokenProgramId,
      apeMintAccount.publicKey,
      publicKey,
    );

    var createAssocTokenIx = Token.createAssociatedTokenAccountInstruction(
      associatedTokenProgramId,
      tokenProgramId,
      apeMintAccount.publicKey,
      associatedAccountPublicKey,
      publicKey,
      publicKey
    );
    instructions.push(createAssocTokenIx);

    var apeAccountPublicKeyNonce = await PublicKey.findProgramAddress([
      Buffer.from("metadata", "utf8"), 
      metaplexProgramId.toBuffer(), 
      apeMintAccount.publicKey.toBuffer()
    ], metaplexProgramId);
    var apeAccountPublicKey = apeAccountPublicKeyNonce[0]

    var buf = Buffer.from([0x00, 0x0f, 0x00, 0x00, 0x00, 0x44, 0x65, 0x67, 0x65, 0x6e, 0x20, 0x41, 0x70, 0x65, 0x20, 0x23, 0x33, 0x37, 0x39, 0x34, 0x04, 0x00, 0x00, 0x00, 0x44, 0x41, 0x50, 0x45, 0x3f, 0x00, 0x00, 0x00, 0x68, 0x74, 0x74, 0x70, 0x73, 0x3a, 0x2f, 0x2f, 0x61, 0x72, 0x77, 0x65, 0x61, 0x76, 0x65, 0x2e, 0x6e, 0x65, 0x74, 0x2f, 0x31, 0x75, 0x53, 0x76, 0x46, 0x49, 0x68, 0x6b, 0x75, 0x69, 0x61, 0x7a, 0x6f, 0x5a, 0x70, 0x64, 0x6c, 0x61, 0x78, 0x4f, 0x44, 0x62, 0x31, 0x69, 0x68, 0x61, 0x6e, 0x31, 0x64, 0x36, 0x38, 0x57, 0x73, 0x47, 0x72, 0x50, 0x31, 0x75, 0x63, 0x33, 0x6f, 0x6f, 0x38, 0x00, 0x00, 0x00, 0x01])
    const createMetaplexMasterIx = new TransactionInstruction({
      keys: [
        { pubkey: apeAccountPublicKey, isSigner: false, isWritable: true },
        { pubkey: apeMintAccount.publicKey, isSigner: true, isWritable: false },
        { pubkey: publicKey, isSigner: true, isWritable: false },
        { pubkey: publicKey, isSigner: true, isWritable: false },
        { pubkey: publicKey, isSigner: true, isWritable: false },
        { pubkey: systemProgramId, isSigner: false, isWritable: false },
        { pubkey: sysvarRentAccountPublicKey, isSigner: false, isWritable: false },
      ],
      programId: metaplexProgramId,
      data: apeBuffer,
    });
    instructions.push(createMetaplexMasterIx)

    var mintIx = Token.createMintToInstruction(
      TOKEN_PROGRAM_ID,
      apeMintAccount.publicKey,
      associatedAccountPublicKey,
      publicKey,
      [],
      1,
    )
    instructions.push(mintIx);

    var apeAccountPublicKeyNonce = await PublicKey.findProgramAddress([
      Buffer.from("metadata", "utf8"), 
      metaplexProgramId.toBuffer(), 
      apeMintAccount.publicKey.toBuffer(),
      Buffer.from("edition", "utf8"), 
    ], metaplexProgramId);


    const metaplexProgramIdIx = new TransactionInstruction({
      keys: [
        { pubkey: apeAccountPublicKeyNonce[0], isSigner: false, isWritable: true },
        { pubkey: apeMintAccount.publicKey, isSigner: true, isWritable: false },
        { pubkey: publicKey, isSigner: true, isWritable: false },
        { pubkey: publicKey, isSigner: true, isWritable: false },
        { pubkey: publicKey, isSigner: true, isWritable: false },
        { pubkey: apeAccountPublicKey, isSigner: false, isWritable: true},
        { pubkey: tokenProgramId, isSigner: false, isWritable: false},
        { pubkey: systemProgramId, isSigner: false, isWritable: false },
        { pubkey: sysvarRentAccountPublicKey, isSigner: false, isWritable: false },
      ],
      programId: metaplexProgramId,
      data: Buffer.from([10, 1, 0, 0, 0, 0, 0, 0, 0, 0]),
    });
    instructions.push(metaplexProgramIdIx)



    sendTransaction(connection, wallet, instructions, accounts).then(() => {}, () => {})
  }

  let { page } = useParams<ViewParams>();
  let x = loadAll()

  return (
    <div>    
      <table id='apes'></table>
    </div>
  );
};
