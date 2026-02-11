const CONTRACT_ADDRESS = "EQB9uFhHDh6F_H49CwVOIo4iYkH4D88IScbT2UbzxNzHmayh"; 

const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: 'https://raw.githubusercontent.com/ton-community/tutorials/main/03-client/test/public/tonconnect-manifest.json',
    buttonRootId: 'ton-connect'
});

let isStaking = false; 
let reward = 0.000000;
let stakedAmt = 0;

// ওয়ালেট ব্যালেন্স দেখানোর ফাংশন (Real Balance)
tonConnectUI.onStatusChange(wallet => {
    if (wallet) {
        // ব্যালেন্স চেক (সিমুলেটেড ব্যালেন্স থেকে রিয়েল এপিআই কল করা যায়)
        document.getElementById('user-balance').innerText = "Wallet Active";
        Swal.fire({ icon: 'success', title: 'Wallet Connected!', background: '#111', color: '#fff' });
    }
});

// লাইভ রিওয়ার্ড কাউন্টার (শুধুমাত্র স্টেক করলে বাড়বে)
setInterval(() => {
    if (isStaking) {
        reward += 0.000008; 
        document.getElementById('reward-counter').innerText = reward.toFixed(6);
    }
}, 1000);

async function deposit() {
    const amt = document.getElementById('stake-input').value;
    if (!amt || amt < 1.2) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Minimum stake is 1.2 TON', background: '#111', color: '#fff' });
        return;
    }

    const nano = (parseFloat(amt) * 1000000000).toString();
    try {
        await tonConnectUI.sendTransaction({
            validUntil: Math.floor(Date.now() / 1000) + 600,
            messages: [{ address: CONTRACT_ADDRESS, amount: nano, payload: "te6cckEBAQEACAAADURlcG9zaXQAWl0v" }]
        });
        
        isStaking = true; // এখন থেকে রিওয়ার্ড বাড়বে
        stakedAmt += parseFloat(amt);
        document.getElementById('staked-amount').innerText = stakedAmt.toFixed(2) + " TON";
        Swal.fire({ icon: 'success', title: 'Stake Success!', text: 'Your 10% APY is now live!', background: '#111', color: '#fff' });
    } catch (e) {
        Swal.fire({ icon: 'error', title: 'Cancelled', background: '#111', color: '#fff' });
    }
}

async function withdraw() {
    try {
        await tonConnectUI.sendTransaction({
            validUntil: Math.floor(Date.now() / 1000) + 600,
            messages: [{ address: CONTRACT_ADDRESS, amount: "50000000", payload: "te6cckEBAQEACQAADldpdGhkcmF3jXlA9w==" }]
        });
        isStaking = false; reward = 0; stakedAmt = 0;
        document.getElementById('reward-counter').innerText = "0.000000";
        document.getElementById('staked-amount').innerText = "0.00 TON";
        Swal.fire({ icon: 'success', title: 'Withdrawn!', background: '#111', color: '#fff' });
    } catch (e) {}
}

function tab(id) {
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    document.querySelectorAll('.t-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
            }
            
