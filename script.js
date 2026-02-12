// আপনার স্মার্ট কন্ট্রাক্ট অ্যাড্রেস
const CONTRACT_ADDRESS = "EQB9uFhHDh6F_H49CwVOIo4iYkH4D88IScbT2UbzxNzHmayh"; 

// ১. TON Connect UI Setup (Manifest URL আপডেট করা হয়েছে যেন মোবাইল রিডাইরেক্ট ঠিক হয়)
const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: 'https://ton-connect.github.io/demo-dapp-with-react-ui/tonconnect-manifest.json',
    buttonRootId: 'ton-connect'
});

// ২. স্টেট ভেরিয়েবল
let isStakingActive = false;
let currentRewards = 0.000000;
let myTotalStake = 0;

// ৩. ওয়ালেট কানেকশন লজিক এবং ব্যালেন্স চেক
tonConnectUI.onStatusChange(async (wallet) => {
    const balanceDisplay = document.getElementById('real-balance');
    if (wallet) {
        // ওয়ালেট কানেক্ট হলে
        const address = wallet.account.address;
        const shortAddr = address.slice(0, 4) + "..." + address.slice(-4);
        
        if(balanceDisplay) {
            balanceDisplay.innerText = "Wallet: " + shortAddr;
            balanceDisplay.style.color = "#0098EA";
        }

        Swal.fire({
            title: 'Connected!',
            text: 'Wallet successfully linked.',
            icon: 'success',
            background: '#111',
            color: '#fff',
            timer: 2000,
            showConfirmButton: false
        });
    } else {
        // ডিসকানেক্ট হলে
        if(balanceDisplay) balanceDisplay.innerText = "-- TON";
        isStakingActive = false;
        currentRewards = 0;
        updateDisplay();
    }
});

// ৪. লাইভ রিওয়ার্ড কাউন্টার (লজিক ফিক্স: স্টেক করার পর কাউন্ট শুরু হবে)
setInterval(() => {
    if (isStakingActive && myTotalStake > 0) {
        // প্রতি সেকেন্ডে প্রফিট বাড়বে (১০% APY সিমুলেশন)
        currentRewards += 0.000015; 
        const rewardEl = document.getElementById('live-earnings');
        if(rewardEl) rewardEl.innerText = currentRewards.toFixed(6);
    }
}, 1000);

// ৫. ডিপোজিট ফাংশন (Stake TON)
async function stakeNow() {
    const amountInput = document.getElementById('amt-input');
    const amount = amountInput.value;

    if (!amount || amount < 1.2) {
        Swal.fire({
            title: 'Invalid Amount',
            text: 'Please enter at least 1.2 TON',
            icon: 'warning',
            background: '#111',
            color: '#fff'
        });
        return;
    }

    // ১.২ টনকে ন্যানোটন এ রূপান্তর
    const nanoAmount = (parseFloat(amount) * 1000000000).toString();

    const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 360, // ৬ মিনিট ভ্যালিডিটি
        messages: [
            {
                address: CONTRACT_ADDRESS,
                amount: nanoAmount,
                // "Deposit" কমান্ডের সঠিক পে-লোড
                payload: "te6cckEBAQEACAAADURlcG9zaXQAWl0v" 
            }
        ]
    };

    try {
        // লোডিং এনিমেশন
        Swal.fire({
            title: 'Confirming...',
            text: 'Please check your wallet app',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading() }
        });

        await tonConnectUI.sendTransaction(transaction);

        // ট্রানজ্যাকশন সফল হলে
        isStakingActive = true;
        myTotalStake += parseFloat(amount);
        updateDisplay();

        Swal.fire({
            title: 'Staking Success! 🚀',
            text: 'Your rewards are now growing live.',
            icon: 'success',
            background: '#111',
            color: '#fff'
        });
        amountInput.value = ""; // ইনপুট ক্লিয়ার করা

    } catch (error) {
        console.error("Tx Error:", error);
        Swal.fire({
            title: 'Transaction Failed',
            text: 'Make sure you have enough balance including gas fees.',
            icon: 'error',
            background: '#111',
            color: '#fff'
        });
    }
}

// ৬. উইথড্র ফাংশন
async function withdrawAll() {
    if (myTotalStake <= 0) {
        Swal.fire({ title: 'No active stake found', icon: 'info', background: '#111', color: '#fff' });
        return;
    }

    const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 360,
        messages: [
            {
                address: CONTRACT_ADDRESS,
                amount: "50000000", // গ্যাস ফি এর জন্য ০.০৫ টন
                payload: "te6cckEBAQEACQAADldpdGhkcmF3jXlA9w==" // "Withdraw" কমান্ড
            }
        ]
    };

    try {
        await tonConnectUI.sendTransaction(transaction);
        
        isStakingActive = false;
        myTotalStake = 0;
        currentRewards = 0;
        updateDisplay();

        Swal.fire({ title: 'Withdrawn Successfully!', icon: 'success', background: '#111', color: '#fff' });
    } catch (error) {
        Swal.fire({ title: 'Withdrawal Failed', icon: 'error', background: '#111', color: '#fff' });
    }
}

// ৭. UI আপডেট ফাংশন
function updateDisplay() {
    const stakedEl = document.getElementById('staked-val');
    const rewardEl = document.getElementById('live-earnings');
    
    if(stakedEl) stakedEl.innerText = myTotalStake.toFixed(2) + " TON";
    if(rewardEl) rewardEl.innerText = currentRewards.toFixed(6);
}
