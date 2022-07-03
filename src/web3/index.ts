import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum: ethers.providers.ExternalProvider;
  }
}

export type Signer = ethers.Signer;

// todo - `hearts.bigcomputer.eth` or something
const CONTRACT_ADDRESS = '0xf1E4027e749FC892dfD9D16f13B2FBE93E9a474E';
let _provider: ethers.providers.Web3Provider;
let _signer: ethers.Signer;

// The SoulboundHeart ABI (conforms to ERC721)
const soulboundHeartsAbi = [
  // Some details about the token
  'function name() view returns (string)',
  'function symbol() view returns (string)',

  // Get the account balance
  'function balanceOf(address) view returns (uint)',

  // Issue / mint a new SoulboundHeart
  'function issueSoulboundHeart()',

  // Events
  'event Transfer(address indexed from, address indexed to, uint amount)'
];

export const getProvider = async () => {
  // A Web3Provider wraps a standard Web3 provider, which is
  // what MetaMask injects as window.ethereum into each page
  _provider = new ethers.providers.Web3Provider(window.ethereum);
  return _provider;
};

export const getSigner = async (provider = _provider) => {
  // MetaMask requires requesting permission to connect users accounts
  await provider.send('eth_requestAccounts', []);

  // The MetaMask plugin also allows signing transactions to
  // send ether and pay to change state within the blockchain.
  // For this, you need the account signer...
  _signer = provider.getSigner();

  return _signer;
};

export const getBalance = async (
  address: string | Promise<string> = _signer.getAddress(),
  provider = _provider,
) => {
  const contract = new ethers.Contract(CONTRACT_ADDRESS, soulboundHeartsAbi, provider);
  return contract.balanceOf(await address);
};

export const issueSoulboundHeart = async (signer = _signer) => {
  const contract = new ethers.Contract(CONTRACT_ADDRESS, soulboundHeartsAbi, signer);
  await contract.issueSoulboundHeart();

  const filterReceivedTransfer = contract.filters.Transfer(null, await signer.getAddress());

  await contract.queryFilter(filterReceivedTransfer);
};

export const revokeSoulboundHeart = async (signer = _signer) => {
  // todo - need to implement burning!
};
