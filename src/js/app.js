// App = {
//   web3Provider: null,
//   contracts: {},
//   account: 0x0,
//   loading:false,

//   init: function() {
//     return App.initWeb3();
//   },

//   initWeb3: function() {
//     // initialize web3
//     if(typeof web3 !== 'undefined') {
//       //reuse the provider of the Web3 object injected by Metamask
//       App.web3Provider = web3.currentProvider;
//     } else {
//       //create a new provider and plug it directly into our local node
//       App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
//     }
//     web3 = new Web3(App.web3Provider);

//     App.displayAccountInfo();

//     return App.initContract();
//   },

//   displayAccountInfo: function() {
//     web3.eth.getCoinbase(function(err, account) {
//       if(err === null) {
//         App.account = account;
//         $('#account').text(account);
//         web3.eth.getBalance(account, function(err, balance) {
//           if(err === null) {
//             $('#accountBalance').text(web3.fromWei(balance, "ether") + " ETH");
//           }
//         })
//       }
//     });
//   },

//   initContract: function() {
//     $.getJSON('ChangeName.json', function(ChangeNameArtifact) {
//       // get the contract artifact file and use it to instantiate a truffle contract abstraction
//       App.contracts.ChangeName = TruffleContract(ChangeNameArtifact);
//       // set the provider for our contracts
//       App.contracts.ChangeName.setProvider(App.web3Provider);
//       // retrieve the article from the contract
//       //return App.reloadArticles();
//     });
//   },

// };

// $(function() {
//   $(window).load(function() {
//     App.init();
//   });
// });
// const serverUrl = "https://cyk88gduca4p.usemoralis.com:2053/server"; //Server url from moralis.io
// // const appId = "r7VfwpNbhgc8yCKZa9Pfh1Hu6aWvBkZC8CYWsJnx"; // Application id from moralis.io
Moralis.initialized("https://cyk88gduca4p.usemoralis.com:2053/server");
const appId = "r7VfwpNbhgc8yCKZa9Pfh1Hu6aWvBkZC8CYWsJnx";
let currentTrade = {};
let currentSelectSide;
let tokens;

async function init() {
  await Moralis.start({ serverUrl, appId });
  await Moralis.enableWeb3();
  await listAvailableTokens();
  currentUser = Moralis.User.current();
  if (currentUser) {
    document.getElementById("swap_button").disabled = false;
  }
}

async function listAvailableTokens() {
  const result = await Moralis.Plugins.oneInch.getSupportedTokens({
    chain: "eth", // The blockchain you want to use (eth/bsc/polygon)
  });
  tokens = result.tokens;
  let parent = document.getElementById("token_list");
  for (const address in tokens) {
    let token = tokens[address];
    let div = document.createElement("div");
    div.setAttribute("data-address", address);
    div.className = "token_row";
    let html = `
        <img class="token_list_img" src="${token.logoURI}">
        <span class="token_list_text">${token.symbol}</span>
        `;
    div.innerHTML = html;
    div.onclick = () => {
      selectToken(address);
    };
    parent.appendChild(div);
  }
}

function selectToken(address) {
  closeModal();
  console.log(tokens);
  currentTrade[currentSelectSide] = tokens[address];
  console.log(currentTrade);
  renderInterface();
  getQuote();
}

function renderInterface() {
  if (currentTrade.from) {
    document.getElementById("from_token_img").src = currentTrade.from.logoURI;
    document.getElementById("from_token_text").innerHTML = currentTrade.from.symbol;
  }
  if (currentTrade.to) {
    document.getElementById("to_token_img").src = currentTrade.to.logoURI;
    document.getElementById("to_token_text").innerHTML = currentTrade.to.symbol;
  }
}

async function login() {
  try {
    currentUser = Moralis.User.current();
    if (!currentUser) {
      currentUser = await Moralis.authenticate();
    }
    document.getElementById("swap_button").disabled = false;
  } catch (error) {
    console.log(error);
  }
}

function openModal(side) {
  currentSelectSide = side;
  document.getElementById("token_modal").style.display = "block";
}
function closeModal() {
  document.getElementById("token_modal").style.display = "none";
}

async function getQuote() {
  if (!currentTrade.from || !currentTrade.to || !document.getElementById("from_amount").value) return;

  let amount = Number(document.getElementById("from_amount").value * 10 ** currentTrade.from.decimals);

  const quote = await Moralis.Plugins.oneInch.quote({
    chain: "eth", // The blockchain you want to use (eth/bsc/polygon)
    fromTokenAddress: currentTrade.from.address, // The token you want to swap
    toTokenAddress: currentTrade.to.address, // The token you want to receive
    amount: amount,
  });
  console.log(quote);
  document.getElementById("gas_estimate").innerHTML = quote.estimatedGas;
  document.getElementById("to_amount").value = quote.toTokenAmount / 10 ** quote.toToken.decimals;
}

async function trySwap() {
  let address = Moralis.User.current().get("ethAddress");
  let amount = Number(document.getElementById("from_amount").value * 10 ** currentTrade.from.decimals);
  if (currentTrade.from.symbol !== "ETH") {
    const allowance = await Moralis.Plugins.oneInch.hasAllowance({
      chain: "eth", // The blockchain you want to use (eth/bsc/polygon)
      fromTokenAddress: currentTrade.from.address, // The token you want to swap
      fromAddress: address, // Your wallet address
      amount: amount,
    });
    console.log(allowance);
    if (!allowance) {
      await Moralis.Plugins.oneInch.approve({
        chain: "eth", // The blockchain you want to use (eth/bsc/polygon)
        tokenAddress: currentTrade.from.address, // The token you want to swap
        fromAddress: address, // Your wallet address
      });
    }
  }
  try {
    let receipt = await doSwap(address, amount);
    alert("Swap Complete");
  } catch (error) {
    console.log(error);
  }
}

function doSwap(userAddress, amount) {
  return Moralis.Plugins.oneInch.swap({
    chain: "eth", // The blockchain you want to use (eth/bsc/polygon)
    fromTokenAddress: currentTrade.from.address, // The token you want to swap
    toTokenAddress: currentTrade.to.address, // The token you want to receive
    amount: amount,
    fromAddress: userAddress, // Your wallet address
    slippage: 1,
  });
}

init();

document.getElementById("modal_close").onclick = closeModal;
document.getElementById("from_token_select").onclick = () => {
  openModal("from");
};
document.getElementById("to_token_select").onclick = () => {
  openModal("to");
};
document.getElementById("login_button").onclick = login;
document.getElementById("from_amount").onblur = getQuote;
document.getElementById("swap_button").onclick = trySwap;
