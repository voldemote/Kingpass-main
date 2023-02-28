/* eslint-disable no-console */

import { ethers } from 'ethers';
import contracts from './contracts.json';
import  erc20ABI from './erc20ABI.json'

let signer: any = null;
let provider: any = null;

let kingPass: any = null;

let kingPassWithSigner:any = null;
let stableCoin: any = null

export const initializeWeb3 = async (provider_: any, signer_: any) => {
  stableCoin = new ethers.Contract(contracts.KINGpass_abi.address, erc20ABI, signer_);
  kingPassWithSigner = new ethers.Contract(contracts.KINGpass_abi.address, contracts.KINGpass_abi.abi, signer_);
  kingPass = new ethers.Contract(contracts.KINGpass_abi.address, contracts.KINGpass_abi.abi, provider_);

  provider = provider_;
  signer = await signer_;
};

export const getKingpassStatus = async (address: string | undefined) => {
  const activeStatus = await kingPass.checkIfPassActive(address);
  const hasKingpass = await kingPass.firstNft(address);
  if (!hasKingpass) {
    return 0;
  } else if (hasKingpass && !activeStatus) {
    return 1;
  } else if (activeStatus) {
    return 2;
  }
};

export const getTypeofUser = async (address: string | undefined) => {
  if(kingPass !== undefined) {
    const typeOfUser = await kingPass.typeOfUser(address);
    return typeOfUser;
  }
};

export const handleClaim = async () => {
  const tx = await kingPassWithSigner.activateKingPass();
  await tx.wait();
};

export const handleStartSubScription = async (months: number, currency: string, status: boolean) => {
  const user_address = await signer.getAddress()
  const _stableCoin = (stableCoin).attach(currency);
  const _kingPassCost = await kingPass.pricePass();
  const userBalance = await _stableCoin.balanceOf(user_address);
  const userAllowance = await _stableCoin.allowance(user_address, contracts.KINGpass_abi.address)
  const _months =  (await kingPass.pricePass()).mul(months);
  if(parseInt(userAllowance) < parseInt(_kingPassCost)) {
    const tx = await _stableCoin.connect(signer).approve(contracts.KINGpass_abi.address, _months);
    await tx.wait();
  }
  if(parseInt(userBalance) >= parseInt(_kingPassCost)) {
    const __months = status ? 1 : months
    const tx = await kingPassWithSigner.buyPass(__months, currency, status);
    await tx.wait();
  } else {
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw "Sorry! You don’t have enough funds";
  }
}

export const handleKingpassWithdraw = async () => {

  const tx = await kingPassWithSigner.deactivateKingPass();
  await tx.wait();
}

export const handleSubscriptionCancel = async () => {
  const tx = await kingPassWithSigner.deactivateSubscription();
  await tx.wait();
}

export const hasUserKing = async (amount: string | undefined) => {
  const value = 200000;
  const MinKingToLock = ethers.utils.parseUnits(value.toString(), 9).toString();
  if(Number(amount) * Math.pow(10, 18) >= Number(MinKingToLock)) {
    return true;
  } 
  return false;
}

const changeTimeStampIntoTime = (timestamp: number) => {
  const date = new Date(timestamp * 1000); // Convert timestamp to milliseconds and create a new Date object
  const options = { day: '2-digit' as const, month: 'short' as const, year: 'numeric' as const, timeZone: 'UTC' };
  const formattedDate = new Intl.DateTimeFormat('en-US', options).format(date);
  return formattedDate
}

export const getActiveUntill = async (addy: string | undefined) => {
  if(kingPass !== undefined && addy !== undefined) {
    const tx = await kingPass.activeUntill(addy);
    const active = parseInt(tx);
    const res = changeTimeStampIntoTime(active);
    return res
  }
}

export const handleExtend = async (addy: string | undefined, months: number) => {
  if(kingPassWithSigner !== undefined && addy !== undefined) {
    const passAddy = await kingPass.usertToPaymentType(addy);
    const kingPrice =  await kingPass.pricePass();
    const totalPrice = kingPrice.mul(months);
    const _stableCoin = await stableCoin.attach(passAddy)
    const tx = await _stableCoin.increaseAllowance(contracts.KINGpass_abi.address, totalPrice)
    return tx;
  }
}