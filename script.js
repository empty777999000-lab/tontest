// আপনার স্মার্ট কন্ট্রাক্ট অ্যাড্রেস
const CONTRACT_ADDRESS = "EQApZ3tEu5mlOtmxhC4mwKD8Bc1Pf9VtfXyfgPyCZt2lwyno";

// ১. কানেকশন সেটআপ (QR Code ফিক্স করা হয়েছে)
const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: 'https://ton-connect.github.io/demo-dapp-with-react-ui/tonconnect-manifest.json',
    buttonRootId: 'ton-connect-btn'
});

// ২. ভেরিয়েবল
let walletBalance = 0; // কানেক্ট হলে আপডেট হবে (Simulated for Testnet)
let stakedBalance = 0.0000;

// ৩. ওয়ালেট কানেক্ট হলে কি হবে
tonConnectUI.onStatusChange(wallet => {
    const balEl = document.getElementById('wallet-balance');
    
    if (wallet) {
        // ডেমো ব্যালেন্স (টেস্টনেটে API ছাড়া রিয়েল ব্যালেন্স আনা কঠিন, তাই ডেমো দেখাচ্ছি)
        walletBalance = 5.5; 
        balEl.innerText = walletBalance + " TON";
        balEl.style.color = "#00FFA3";

        const shortAddress = wallet.account.address.slice(0, 4) + '...' + wallet.account.address.slice(-4);
        
        Swal.fire({
            toast: true, position: 'top', icon: 'success', 
            title: 'Connected: ' + shortAddress, 
            showConfirmButton: false, timer: 2000,
            background: '#111', color: '#fff'
        });
    } else {
        balEl.innerText = "--";
        walletBalance = 0;
    }
});

// ৪. ইনপুট বাটন লজিক (25%, 50%, Max)
function setPercent(pct) {
    if(walletBalance === 0) return;
    const amount = (walletBalance * pct) / 100;
    document.getElementById('amount').value = amount.toFixed(2);
}

// ৫. ডিপোজিট ফাংশন (STAKE)
async function deposit() {
    const amount = document.getElementById('amount').value;

    // ভ্যালিডেশন চেক
    if (!amount || amount < 1.2) {
        Swal.fire({
            title: 'Invalid Amount',
            text: 'Minimum Stake is 1.2 TON',
            icon: 'warning',
            background: '#111', color: '#fff', confirmButtonColor: '#00FFA3'
        });
        return;
    }

    const nanoAmount = (parseFloat(amount) * 1000000000).toString();

    const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [{
            address: CONTRACT_ADDRESS,
            amount: nanoAmount,
            payload: "te6cckEBAQEACAAADURlcG9zaXQAWl0v" // "Deposit" Text Payload
        }]
    };

    try {
        await tonConnectUI.sendTransaction(transaction);
        
        // সফল হলে UI আপডেট
        stakedBalance += parseFloat(amount);
        document.getElementById('staked-amount').innerText = stakedBalance.toFixed(4);
        
        Swal.fire({
            title: 'Success! 🚀',
            text: 'Assets Staked Successfully',
            icon: 'success',
            background: '#111', color: '#fff', confirmButtonColor: '#00FFA3'
        });

    } catch (e) {
        Swal.fire({
            title: 'Transaction Cancelled',
            icon: 'error',
            background: '#111', color: '#fff'
        });
    }
}

// ৬. উইথড্র ফাংশন (UNSTAKE)
async function withdraw() {
    if(stakedBalance <= 0) {
        Swal.fire({ title: 'No Staked Assets', icon: 'info', background: '#111', color: '#fff' });
        return;
    }
    
    try {
        await tonConnectUI.sendTransaction({
            validUntil: Math.floor(Date.now() / 1000) + 600,
            messages: [{
                address: CONTRACT_ADDRESS,
                amount: "50000000", // Gas Fee
                payload: "te6cckEBAQEACQAADldpdGhkcmF3jXlA9w==" // "Withdraw" Text Payload
            }]
        });

        // ব্যালেন্স রিসেট
        stakedBalance = 0;
        document.getElementById('staked-amount').innerText = "0.0000";

        Swal.fire({ title: 'Unstaked Successfully', icon: 'success', background: '#111', color: '#fff' });
    } catch (e) {}
}

// ৭. ক্লেইম ফাংশন (উইথড্র এর মতোই কাজ করবে আপাতত)
async function claim() {
    withdraw();
}
