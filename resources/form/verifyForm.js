//  Web3 intializer
//  ABI definition, Binary Data and contract Address in contractDetails.js
//const Web3 = require('web3');
//const Tx = require('ethereumjs-tx'); 

const web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/6a68c430ab2e43adb0762c4cfa9bbb42"));
/*var kycContract = web3.eth.contract(abi);
var deployedContract = kycContract.new({
    data: binaryData,
    from: web3.eth.accounts[0],
    gas: 4700000
});
var contractInstance = kycContract.at(contractAddress); */

const contractInstance = new web3.eth.Contract(abi, contractAddress);

//  account to make all transactions
var current_bankPriveKey = localStorage.getItem("bankPrivKey");
var current_bankAddress = localStorage.getItem("bankAddress");
var current_bank_name_l = localStorage.getItem("bank_name_l");
var current_user_name_v = localStorage.getItem("user_name_v");

var starsTotal = 5;

var element = [
    "first_name",
    "middle_name",
    "last_name",
    "nik",
    "occupation",
    "income",
    "dob",
    "gender_m",
    "gender_f",
    "residence",
    "phone1",
    "phone2",
    "email",
    "country"
];


//var current_account = localStorage.bank_eth_account;
//var user_name = localStorage.user_name_v;

window.onload = function() { 
    fillForm();
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


//  function to fill customer data in form

async function fillForm() {
    let viewCust = await contractInstance.methods.viewCustomer(current_user_name_v).call();
    let viewBankRating = await contractInstance.methods.getBankRating(current_bank_name_l).call();
    /*
    let viewCust2 = await contractInstance.methods.viewCustomer2(current_username).call();
    let viewCust3 = await contractInstance.methods.viewCustomer3(current_username).call();
    */
    document.getElementById("kyc_status").innerHTML = viewCust[5];

    const toStar = parseFloat(viewCust[4])/100;
    // Get percentage
    const starPercentage = (toStar/starsTotal) * 100;
    // Round to nearest 2
    const starPercentageRounded = `${Math.round(starPercentage/2) * 2}%`;
    // Set width of stars-inner to percentage
    document.querySelector(".stars-inner").style.width = starPercentageRounded;
    // Add number rating
    document.querySelector(".customer_rating").innerHTML = toStar;

    //document.getElementById("customer_rating").innerHTML = viewCust[4];
    
    document.getElementById("customer_address").innerHTML = viewCust[0];
    document.getElementById("username").innerHTML = viewCust[1];
    //document.getElementById("bank_name").innerHTML = viewCust[3];
    //document.getElementById("bank_rating").innerHTML = viewBankRating[0];
    var dataProfile = viewCust[2];
    var fill = "";
    var check = Math.min(dataProfile.length);
    for(var i=0; i<check; i++) {
        if (dataProfile.charAt(i) == '!' && dataProfile.charAt(i+1) == '@' && dataProfile.charAt(i+2) == '#') {
            for (var j=i+3; j<check; j++) {
                fill = fill + dataProfile.charAt(j);
                if (dataProfile.charAt(j) == '!') {
                    document.getElementById(element[i]).innerHTML = fill;
                    fill = ""
                    break;
                }
            }
        }
    }

    /*
    var oldData = contractInstance.viewCustomer.call(user_name, {
        from: current_account,
        gas: 4700000
    });
    document.getElementById("customer_rating").innerHTML = contractInstance.getCustomerRating.call(user_name, {
        from: current_account,
        gas: 4700000
    }) / 100;
    var toFill = "";
    for (var i = 0, j = 0; i < (oldData.length - 2); ++i) {
        if (oldData[i] == '!' && oldData[i + 1] == '@' && oldData[i + 2] == '#') {
            if (j == 7) {
                document.getElementById("gender_m").innerHTML = toFill;
                j += 2;
                i += 2;
                toFill = "";
                continue;
            }
            if (toFill == "")
                toFill = "Null";
            document.getElementById(allIds[j]).innerHTML = toFill;
            toFill = "";
            j++;
            i += 2;
            continue;
        }
        toFill = toFill + oldData[i];
    }

    document.getElementById("bank_name").innerHTML = contractInstance.getCustomerBankName.call(user_name, {
        from: current_account,
        gas: 4700000
    });
    document.getElementById("bank_rating").innerHTML = (contractInstance.getCustomerBankRating.call(user_name, {
        from: current_account,
        gas: 4700000
    })) / 100;
    */
}

//  fill the KYC form
//fillForm();


async function onClickAccept() {
    /*let verified = await contractInstance.methods.setCustVerified(current_user_name_v).send({
        from: current_bankAddress,
        gas: 4700000
    }); */

    let verified = await contractInstance.methods.setCustVerified(current_user_name_v).encodeABI();
    sendSign(verified,20000);

    if (verified == 0) {
        alert("Customer profile successfully verified.");
        localStorage.removeItem("user_name_v");
        window.location = '../bankHomePage.html';
        return false;
    } else {
        alert("Customer profile hasn't been successfully verified.");
        return false;
    }
}


async function onClickReject() {
    /*let rejected = await contractInstance.methods.setCustRejected(current_user_name_v).send({
        from: current_bankAddress,
        gas: 4700000
    }); */

    let rejected = await contractInstance.methods.setCustRejected(current_user_name_v).encodeABI();
    sendSign(rejected,20000);

    if (rejected == 0) {
        alert("Customer profile successfully rejected.");
        localStorage.removeItem("user_name_v");
        window.location = '../bankHomePage.html';
        return false;
    } else {
        alert("Customer profile hasn't been successfully rejected.");
        return false;
    }
}