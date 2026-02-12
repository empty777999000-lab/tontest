// ✅ আপনার নতুন কন্ট্রাক্ট অ্যাড্রেস
const CONTRACT_ADDRESS = "EQCB_LdD8e78avMmJwU6ZsqVMhgrSQNT54TjYiPoPTwrqE6g";

const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: 'https://ton-connect.github.io/demo-dapp-with-react-ui/tonconnect-manifest.json',
    buttonRootId: 'ton-connect-btn'
});

let walletBalance = 0; 
let stakedBalance = 0.0000;

// ১. ওয়ালেট স্ট্যাটাস চেক
tonConnectUI.onStatusChange(wallet => {
    const balEl = document.getElementById('wallet-balance');
    if (wallet) {
        walletBalance = 5.0; // ডেমো ব্যালেন্স
        balEl.innerText = "Active"; 
        balEl.style.color = "#00FFA3";
        
        // ছোট করে অ্যাড্রেস দেখানো
        const rawAddress = wallet.account.address;
        const shortAddr = rawAddress.slice(0, 4) + "..." + rawAddress.slice(-4);

        Swal.fire({
            toast: true, position: 'top', icon: 'success', 
            title: 'Connected: ' + shortAddr, 
            showConfirmButton: false, timer: 2000,
            background: '#111', color: '#fff'
        });
    } else {
        balEl.innerText = "--";
    }
});

// ২. পার্সেন্টেজ বাটন লজিক
function setPercent(pct) {
    if(walletBalance === 0) return;
    document.getElementById('amount').value = (walletBalance * pct / 100).toFixed(2);
}

// 🔥 ৩. ডিপোজিট ফাংশন (NO PAYLOAD - নিরাপদ)
async function deposit() {
    const amount = document.getElementById('amount').value;

    if (!amount || amount < 1.2) {
        Swal.fire({ title: 'Min 1.2 TON', icon: 'warning', background: '#111', color: '#fff' });
        return;
    }

    const nanoAmount = (parseFloat(amount) * 1000000000).toString();

    const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [{
            address: CONTRACT_ADDRESS,
            amount: nanoAmount
            // ❌ Payload লাইন ডিলিট করা হয়েছে (Emulation Error ফিক্স)
            // কন্ট্রাক্ট অটোমেটিক টাকা রিসিভ করবে
        }]
    };

    try {
        await tonConnectUI.sendTransaction(transaction);
        
        stakedBalance += parseFloat(amount);
        document.getElementById('staked-amount').innerText = stakedBalance.toFixed(4);
        
        Swal.fire({
            title: 'Success! 🚀',
            text: 'Deposit Sent Successfully',
            icon: 'success',
            background: '#111', color: '#fff', confirmButtonColor: '#00FFA3'
        });

    } catch (e) {
        console.error(e);
        Swal.fire({ 
            title: 'Failed', 
            text: 'Transaction declined or cancelled', 
            icon: 'error', background: '#111', color: '#fff' 
        });
    }
}

// ৪. উইথড্র ফাংশন (Payload সহ)
async function withdraw() {
    try {
        await tonConnectUI.sendTransaction({
            validUntil: Math.floor(Date.now() / 1000) + 600,
            messages: [{
                address: CONTRACT_ADDRESS,
                amount: "50000000", // 0.05 TON গ্যাস ফি
                payload: "te6cckEBAQEACQAADldpdGhkcmF3jXlA9w==" // "Withdraw" কমেন্ট
            }]
        });
        document.getElementById('staked-amount').innerText = "0.0000";
    } catch (e) {}
}

async function claim() { withdraw(); }
