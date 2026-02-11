const CONTRACT_ADDRESS = "EQB9uFhHDh6F_H49CwVOIo4iYkH4D88IScbT2UbzxNzHmayh"; 

// 1. TON Connect Setup
const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: 'https://raw.githubusercontent.com/ton-community/tutorials/main/03-client/test/public/tonconnect-manifest.json',
    buttonRootId: 'ton-connect'
});

// 2. State Variables (লজিক কন্ট্রোল)
let userStakedAmount = 0;
let rewardBalance = 0.000000;
let isStaking = false; // শুরুতে ফলস থাকবে

// 3. Wallet Connection Listener
tonConnectUI.onStatusChange(wallet => {
    const balanceEl = document.getElementById('wallet-balance');
    if (wallet) {
        // রিয়েল API কল না করে আমরা কানেক্টেড দেখাবো
        // এবং ইউজারের অ্যাড্রেস ছোট করে দেখাবো
        const shortAddress = wallet.account.address.slice(0, 4) + '...' + wallet.account.address.slice(-4);
        balanceEl.innerText = shortAddress;
        balanceEl.style.color = "#fff";
    } else {
        balanceEl.innerText = "--";
        // ডিসকানেক্ট হলে সব রিসেট
        userStakedAmount = 0;
        isStaking = false;
        updateUI();
    }
});

// 4. Tab & Section Switching
function showSection(id) {
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('whitepaper').classList.add('hidden');
    document.getElementById(id).classList.remove('hidden');
    
    // বাটন একটিভ করা
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
}

function setMode(mode) {
    document.querySelectorAll('.action-tab').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    
    if(mode === 'deposit') {
        document.getElementById('deposit-view').style.display = 'block';
        document.getElementById('withdraw-view').style.display = 'none';
    } else {
        document.getElementById('deposit-view').style.display = 'none';
        document.getElementById('withdraw-view').style.display = 'block';
        
        // উইথড্র প্রিভিউ আপডেট
        const total = userStakedAmount + rewardBalance;
        document.getElementById('withdraw-preview').innerText = total.toFixed(4) + " TON";
    }
}

// 5. Reward Loop (ONLY RUNS IF STAKING)
setInterval(() => {
    if (isStaking && userStakedAmount > 0) {
        // প্রতি সেকেন্ডে সামান্য রিওয়ার্ড যোগ হবে
        rewardBalance += 0.000005;
        document.getElementById('live-reward').innerText = rewardBalance.toFixed(6);
    }
}, 1000);

// 6. Deposit Function
async function deposit() {
    const amountInput = document.getElementById('deposit-amount').value;
    
    if (!amountInput || parseFloat(amountInput) < 1.2) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid Amount',
            text: 'Minimum stake is 1.2 TON',
            background: '#111', color: '#fff'
        });
        return;
    }

    const nanoAmount = (parseFloat(amountInput) * 1000000000).toString();
    const payload = "te6cckEBAQEACAAADURlcG9zaXQAWl0v"; // "Deposit"

    try {
        await tonConnectUI.sendTransaction({
            validUntil: Math.floor(Date.now() / 1000) + 600,
            messages: [{
                address: CONTRACT_ADDRESS,
                amount: nanoAmount,
                payload: payload
            }]
        });

        // সফল হলে UI আপডেট এবং রিওয়ার্ড কাউন্টার চালু
        Swal.fire({
            icon: 'success',
            title: 'Staking Started! 🚀',
            text: 'Your rewards are now generating.',
            background: '#111', color: '#fff'
        });

        userStakedAmount += parseFloat(amountInput);
        isStaking = true; // এই লাইনটাই আসল! এখন থেকে চাকা ঘুরবে
        updateUI();

    } catch (e) {
        console.error(e);
        // User cancel করলে কিছু হবে না
    }
}

// 7. Withdraw Function
async function withdraw() {
    if (userStakedAmount <= 0) {
        Swal.fire({icon: 'warning', title: 'Nothing to withdraw', background: '#111', color: '#fff'});
        return;
    }

    const payload = "te6cckEBAQEACQAADldpdGhkcmF3jXlA9w=="; // "Withdraw"

    try {
        await tonConnectUI.sendTransaction({
            validUntil: Math.floor(Date.now() / 1000) + 600,
            messages: [{
                address: CONTRACT_ADDRESS,
                amount: "50000000",
                payload: payload
            }]
        });

        Swal.fire({icon: 'success', title: 'Withdrawal Sent!', background: '#111', color: '#fff'});
        
        // রিসেট UI
        userStakedAmount = 0;
        rewardBalance = 0;
        isStaking = false; // রিওয়ার্ড থামালাম
        updateUI();

    } catch (e) {
        console.error(e);
    }
}

function updateUI() {
    document.getElementById('user-staked').innerText = userStakedAmount.toFixed(2) + " TON";
    document.getElementById('live-reward').innerText = rewardBalance.toFixed(6);
}