//  Web3 intializer
//  ABI definition, Binary Data and contract Address in contractDetails.js
//const Web3 = require('web3');
//const Tx = require('ethereumjs-tx'); 

var web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/6a68c430ab2e43adb0762c4cfa9bbb42"));
/*var kycContract = web3.eth.contract(abi);
var deployedContract = kycContract.new({
    data: binaryData,
    from: web3.eth.accounts[0],
    gas: 4700000
});
var contractInstance = kycContract.at(contractAddress); */

const contractInstance = new web3.eth.Contract(abi, contractAddress);

//var currentEth = localStorage.bank_eth_account;
var current_bankPriveKey = localStorage.getItem("bankPrivKey");
var current_bankAddress = localStorage.getItem("bankAddress");
var current_bank_name_l = localStorage.getItem("bank_name_l");

var starsTotal = 5;

window.onload = function() {
    fillDetails();
    /*
    const toStar = parseFloat(240)/100;
    // Get percentage
    const starPercentage = (toStar/starsTotal) * 100;
    // Round to nearest 2
    const starPercentageRounded = `${Math.round(starPercentage/2) * 2}%`;
    // Set width of stars-inner to percentage
    document.querySelector(".stars-inner").style.width = starPercentageRounded;
    // Add number rating
    document.querySelector(".bank_rating").innerHTML = toStar;
    */
}

web3.eth.defaultAccount = current_bankAddress;
let privateKey1 = new ethereumjs.Buffer.Buffer(current_bankPriveKey, 'hex');

function sendSign(myData,gasLimit){
    web3.eth.getTransactionCount(current_bankAddress, (err, txCount) => {
    // Build the transaction
      const txObject = {
        nonce:    web3.utils.toHex(txCount),
        to:       contractAddress,
        value:    web3.utils.toHex(web3.utils.toWei('0', 'ether')),
        gasLimit: web3.utils.toHex(gasLimit),
        gasPrice: web3.utils.toHex(web3.utils.toWei('6', 'gwei')),
        data: myData  
      }
        // Sign the transaction
        //const tx = new Tx(txObject);
        const tx = new ethereumjs.Tx(txObject);
        tx.sign(privateKey1);

        const serializedTx = tx.serialize();
        const raw = '0x' + serializedTx.toString('hex');

        // Broadcast the transaction
        const transaction = web3.eth.sendSignedTransaction(raw, (err, tx) => {
            console.log(tx)
        });
    });
}


//  function to fill Bank details

async function fillDetails() {
    let viewBank = await contractInstance.methods.viewBank(current_bankAddress).call();
    document.getElementById("bank_address").innerHTML = viewBank[0]; //current_bankAddress
    document.getElementById("bank_name").innerHTML = viewBank[1]; //current_bank_name_l
    document.getElementById("reg_no").innerHTML = viewBank[2];
    document.getElementById("kyc_no").innerHTML = viewBank[3];
    
    const toStar = parseFloat(viewBank[4])/100;
    // Get percentage
    const starPercentage = (toStar/starsTotal) * 100;
    // Round to nearest 2
    const starPercentageRounded = `${Math.round(starPercentage/2) * 2}%`;
    // Set width of stars-inner to percentage
    document.querySelector(".stars-inner").style.width = starPercentageRounded;
    // Add number rating
    document.querySelector(".bank_rating").innerHTML = toStar;

    //document.getElementById("bank_rating").innerHTML = toStar;
}


async function clickVerifyKYC() {
    let user_name_v = document.getElementById("user_name_v").value;
    let getCustForVerify = await contractInstance.methods.getCustForVerify(user_name_v, current_bank_name_l).call();
    if (getCustForVerify == 0) {
        localStorage.setItem("user_name_v",user_name_v);
        window.location = './form/verifyForm.html';
    } else if (getCustForVerify == 2) {
        alert("Customer profile has been verified.");
        //window.location = './bankHomePage.html';
        return false;
    } else {
        alert("Customer profile hasn't been registered yet.");
        //window.location = './bankHomePage.html';
        return false;
    }
}

async function clickDeleteKYC() {
    let user_name_d = document.getElementById("user_name_d").value;
    let getCustForDelete = await contractInstance.methods.getCustForDelete(user_name_d, current_bank_name_l).call();
    if (getCustForDelete == 0) {
        localStorage.setItem("user_name_d",user_name_d);
        window.location = './form/deleteForm.html';
    } else {
        alert("Customer profile hasn't been registered yet.");
        //window.location = './bankHomePage.html';
        return false;
    }

}


//  function to upgrade customer rating

async function increaseRating() {
    let user_name_mr = document.getElementById("user_name_mr").value;
    let checkCustName = await contractInstance.methods.checkCustName(user_name_mr).call();
    if (user_name_mr == checkCustName) {
        /*let increaseRatingCust = await contractInstance.methods.updateRatingCustomer(user_name_mr, true).send({
            from: current_bankAddress,
            gas: 4700000
        }); */

        let increaseRatingCust = await contractInstance.methods.updateRatingCustomer(user_name_mr, true).encodeABI();
        sendSign(increaseRatingCust,200000);

        if (increaseRatingCust == 0) {
            alert("Customer rating successfully upgraded.");
            //window.location = './bankHomePage.html';
            return false;
        } else {
            alert("Customer rating hasn't been successfully upgraded.");
            //window.location = './bankHomePage.html';
            return false;
        }
    }
}

//  function to downgrade customer rating

async function decreaseRating() {
    let user_name_mr = document.getElementById("user_name_mr").value;
    let checkCustName = await contractInstance.methods.checkCustName(user_name_mr).call();
    if (user_name_mr == checkCustName) {
        /*let decreaseRatingCust = await contractInstance.methods.updateRatingCustomer(user_name_mr, false).send({
            from: current_bankAddress,
            gas: 4700000
        }); */

        let decreaseRatingCust = await contractInstance.methods.updateRatingCustomer(user_name_mr, false).encodeABI();
        sendSign(decreaseRatingCust,200000);

        if (decreaseRatingCust == 1) {
            alert("Customer rating successfully downgraded.");
            //window.location = './bankHomePage.html';
            return false;
        } else {
            alert("Customer rating hasn't been successfully downgraded.");
            //window.location = './bankHomePage.html';
            return false;
        } 
    }
}

function logout(){
    localStorage.removeItem("bankPrivKey");
    localStorage.removeItem("bankAddress");
    localStorage.removeItem("bank_name_l");
    localStorage.removeItem("user_name_v");
    localStorage.removeItem("user_name_d");
    window.location.href = "../index.html";
}


// Initial Ratings
/*    
const ratings = {      
    vizio: 2.3,
    panasonic: 3.6,
    phillips: 4.1
}

// Total Stars
const starsTotal = 5;

// Run getRatings when DOM loads
document.addEventListener('DOMContentLoaded', getRatings);

// Form Elements
let productSelect = document.getElementById('product-select');
let ratingControl = document.getElementById('rating-control');

// Init product
let product;

// Product select change
productSelect.addEventListener('change', (e) => {
    product = e.target.value;
    // Enable rating control
    ratingControl.disabled = false;
    ratingControl.value = ratings[product];
});

// Rating control change
ratingControl.addEventListener('blur', (e) => {
    const rating = e.target.value;

    // Make sure 5 or under
    if (rating > 5) {
        alert('Please rate 1 - 5');
        return;
    }

    // Change rating
    ratings[product] = rating;

    getRatings();
});

// Get ratings
function getRatings() {
    for (let rating in ratings) {
        // Get percentage
        const starPercentage = (ratings[rating] / starsTotal) * 100;

        // Round to nearest 10
        const starPercentageRounded = `${Math.round(starPercentage / 10) * 10}%`;

        // Set width of stars-inner to percentage
        document.querySelector(`.${rating} .stars-inner`).style.width = starPercentageRounded;

        // Add number rating
        document.querySelector(`.${rating} .number-rating`).innerHTML = ratings[rating];
    }
}
*/