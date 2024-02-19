import { useEffect, useState } from 'react'
import { ethers } from 'ethers'

// Components
import Navigation from './components/Navigation'
import Section from './components/Section'
import Product from './components/Product'

// ABIs
import Cryptazon from './abis/Cryptazon.json'

// Config
import config from './config.json'

function App() {

  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);

  const [electronics, setElectronics] = useState(null);
  const [clothing, setClothing] = useState(null);
  const [toys, setToys] = useState(null);

  const [item, setItem] = useState({});
  const [toggle, setToggle] = useState(false);

  const togglePop = (item) => {
    setItem(item);
    toggle ? setToggle(false) : setToggle(true);
  }

  const loadBlockchainData = async () => {
    // Connect to Blockchain
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(provider);
    const network = await provider.getNetwork();

    // Connect to Smart Contract
    const contract = new ethers.Contract(
      config[network.chainId].cryptazon.address,
      Cryptazon,
      provider
    );
    setContract(contract);

    // Load Products
    const items = [];
    for (var i = 0; i < 9; i++) {
      const item = await contract.items(i + 1);
      items.push(item);
    }
    const e = items.filter((item) => item.category === 'electronics');
    const c = items.filter((item) => item.category === 'clothing');
    const t = items.filter((item) => item.category === 'toys');
    setElectronics(e);
    setClothing(c);
    setToys(t);
  }

  useEffect(() => {
    loadBlockchainData();
  }, []);
  
  return (
    <div>
      <Navigation account={account} setAccount={setAccount} />

      <h2>Best Sellers</h2>

      {electronics && clothing && toys && (
        <>
          <Section title={"Clothing & Jewelry"} items={clothing} togglePop={togglePop} />
          <Section title={"Electronics & Gadgets"} items={electronics} togglePop={togglePop} />
          <Section title={"Toys & Gaming"} items={toys} togglePop={togglePop} />
        </>
      )}

      {toggle && (
        <Product item={item} provider={provider} account={account} contract={contract} togglePop={togglePop} />
      )}      
    </div>
  );
}

export default App;
