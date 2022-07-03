import * as React from 'react';
import * as web3 from '@src/web3';

export default function Web3Page(): JSX.Element {
  const [balance, setBalance] = React.useState();

  const updateBalance = React.useCallback(async () => {
    try {
      const balance = await web3.getBalance();
      setBalance(balance.toNumber());
    } catch (err) {
      console.error('Error!', err);
    }
  }, []);

  const initializeWeb3 = React.useCallback(async () => {
    try {
      await web3.getProvider();
      await web3.getSigner();
      await updateBalance();
    } catch (err) {
      console.error('Error!', err);
    }
  }, []);

  const issueSoulboundHeart = React.useCallback(async () => {
    try {
      await web3.issueSoulboundHeart();
    } catch (err) {
      console.error('Error!', err);
    }
  }, []);

  return (
    <main>
      <h2>web3 playground</h2>
      <p>Connect: <button onClick={initializeWeb3}>Connect to Web3</button></p>
      <p>Balance: {balance ?? 'N/A'} <button onClick={updateBalance}>Refresh balance</button></p>
      <p>Issue heart: <button onClick={issueSoulboundHeart}>Issue</button></p>
    </main>
  );
}
