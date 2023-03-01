import contracts from '../contracts/contracts.json'

export const isTest = false;

export const Addy = isTest ? contracts.KINGpass_abi.test_address : contracts.KINGpass_abi.address;
export const usdtAddy = isTest ? contracts.KINGpass_abi.test_usdtAddress : contracts.KINGpass_abi.usdtAddress;
export const usdcAddy = isTest ? contracts.KINGpass_abi.test_usdcAddress : contracts.KINGpass_abi.usdcAddress;
export const busdAddy = isTest ? contracts.KINGpass_abi.test_busdAddress : contracts.KINGpass_abi.busdAddress;