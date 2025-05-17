require('dotenv').config();
const { ethers } = require('ethers');

// Setup provider and wallet
const provider = new ethers.JsonRpcProvider("");
const wallet = new ethers.Wallet("", provider);

// Uniswap V3 router contract
const UNISWAP_V3_ROUTER_ADDRESS = '0x2626664c2603336E57B271c5C0b26F421741e481';
const UNISWAP_V3_ROUTER_ABI = [{
  "inputs": [
    {
      "components": [
        { "internalType": "address", "name": "tokenIn", "type": "address" },
        { "internalType": "address", "name": "tokenOut", "type": "address" },
        { "internalType": "uint24", "name": "fee", "type": "uint24" },
        { "internalType": "address", "name": "recipient", "type": "address" },
        { "internalType": "uint256", "name": "amountIn", "type": "uint256" },
        { "internalType": "uint256", "name": "amountOutMinimum", "type": "uint256" },
        { "internalType": "uint160", "name": "sqrtPriceLimitX96", "type": "uint160" }
      ],
      "internalType": "struct IV3SwapRouter.ExactInputSingleParams",
      "name": "params",
      "type": "tuple"
    }
  ],
  "name": "exactInputSingle",
  "outputs": [
    { "internalType": "uint256", "name": "amountOut", "type": "uint256" }
  ],
  "stateMutability": "payable",
  "type": "function"
}];


const USDC = '0x1bc0c42215582d5A085795f4baDbaC3ff36d1Bcb'; // Your USDC address
const WETH = '0x4200000000000000000000000000000000000006'; // Your WETH address
const FEE = 3000; // 0.3%

const router = new ethers.Contract(UNISWAP_V3_ROUTER_ADDRESS, UNISWAP_V3_ROUTER_ABI, wallet);

async function swapETHtoUSDC(amountETH) {
  const amountIn = ethers.parseEther(amountETH.toString()); // convert ETH to wei

  // Parameters for exactInputSingle
  const params = {
    tokenIn: WETH,
    tokenOut: USDC,
    fee: FEE,
    recipient: wallet.address,
    deadline: Math.floor(Date.now() / 1000) + 60 * 10, // 10 minutes from now
    amountIn: amountIn,
    amountOutMinimum: 0, // Accept any amount of USDC (dangerous in prod)
    sqrtPriceLimitX96: 0 // No price limit
  };

  try {
    const tx = await router.exactInputSingle(params, { value: amountIn });
    console.log(`Transaction submitted: ${tx.hash}`);

    const receipt = await tx.wait();
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
  } catch (err) {
    console.error('Swap failed:', err);
  }
}

swapETHtoUSDC(0.00005);
