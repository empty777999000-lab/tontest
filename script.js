// আপনার দেওয়া কন্ট্রাক্ট অ্যাড্রেস
const CONTRACT_ADDRESS = "EQApZ3tEu5mlOtmxhC4mwKD8Bc1Pf9VtfXyfgPyCZt2lwyno";

// ১. ওয়ালেট কানেক্ট সেটআপ (QR কোড ফিক্স)
const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: 'https://ton-connect.github.io/demo-dapp-with-react-ui/tonconnect-manifest.json',
    buttonRootId: 'ton-connect'
});

// ২. ভেরিয়েবল
let isStaking = false;
let userBalance = 0; // সিমুলেটেড ব্যালেন্স

// ৩. কানেকশন চেক
tonConnectUI.onStatusChange(wallet => {
    const balText = document.getElementById('wallet-balance');
    if (wallet) {
        // কানেক্ট হলে ব্যালেন্স দেখাবে
        userBalance = 10.5; // টেস্টনেট ব্যালেন্স (ডেমো)
        balText.innerText = userBalance + " TON";
        
        Swal.fire({
            toast: true, position: 'top-end', icon: 'success', 
            title: 'Wallet Connected', showConfirmButton: false, timer: 2000,
            background: '#1a1a1a', color: '#fff'
        });
    } else {
        balText.innerText = "--";
        userBalance = 0;
    }
});

// ৪. ইনপুট কন্ট্রোল (Percentage Buttons)
function setInput(percent) {
    if(userBalance === 0) return;
    const input = document.getElementById('amount-input');
    const val = (userBalance * percent) / 100;
    input.value = val.toFixed(2);
}

// ৫. STAKE ফাংশন (Deposit)
async function stakeAssets() {
    const amount = document.getElementById('amount-input').value;

    // লজিক চেক
    if (!amount || amount < 1.2) {
        Swal.fire({
            title: 'Invalid Amount',
            text: 'Minimum stake amount is 1.2 TON',
            icon: 'warning',
            background: '#121212', color: '#fff', confirmButtonColor: '#00ffa3'
        });
        return;
    }

    const nanoAmount = (parseFloat(amount) * 1000000000).toString();

    const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 360,
        messages: [{
            address: CONTRACT_ADDRESS,
            amount: nanoAmount,
            payload: "te6cckEBAQEACAAADURlcG9zaXQAWl0v" // "Deposit"
        }]
    };

    try {
        await tonConnectUI.sendTransaction(transaction);
        
        // UI আপডেট
        document.getElementById('staked-balance').innerText = parseFloat(amount).toFixed(4);
        Swal.fire({
            title: 'Staked Successfully!',
            text: 'Your assets are now earning 120% APY',
            icon: 'success',
            background: '#121212', color: '#fff', confirmButtonColor: '#00ffa3'
        });

    } catch (e) {
        console.error(e);
        Swal.fire({
            title: 'Transaction Failed',
            icon: 'error',
            background: '#121212', color: '#fff'
        });
    }
}

// ৬. UNSTAKE ফাংশন
async function unstake() {
    try {
        await tonConnectUI.sendTransaction({
            validUntil: Math.floor(Date.now() / 1000) + 360,
            messages: [{
                address: CONTRACT_ADDRESS,
                amount: "50000000", // Gas Fee
                payload: "te6cckEBAQEACQAADldpdGhkcmF3jXlA9w==" // "Withdraw"
            }]
        });
        document.getElementById('staked-balance').innerText = "0.0000";
    } catch(e) {}
}

// ৭. CLAIM ফাংশন (Same as Withdraw for now)
async function claim() {
    unstake(); // সেইম লজিক
            }
