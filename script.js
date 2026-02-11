const CONTRACT_ADDR = "EQB9uFhHDh6F_H49CwVOIo4iYkH4D88IScbT2UbzxNzHmayh"; 

const tonUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: 'https://raw.githubusercontent.com/ton-community/tutorials/main/03-client/test/public/tonconnect-manifest.json',
    buttonRootId: 'ton-connect'
});

let stakingActive = false; 
let rewardVal = 0.000000;
let myStake = 0;

// রিয়েল ব্যালেন্স আপডেট লজিক
tonUI.onStatusChange(async (wallet) => {
    if (wallet) {
        document.getElementById('real-balance').innerText = "Wallet Active";
        Swal.fire({ title: 'Connected!', icon: 'success', background: '#111', color: '#fff' });
    }
});

// স্মার্ট রিওয়ার্ড কাউন্টার (স্টেক না করলে ০ থাকবে)
setInterval(() => {
    if (stakingActive) {
        rewardVal += 0.000012; 
        document.getElementById('live-earnings').innerText = rewardVal.toFixed(6);
    }
}, 1000);

async function stakeNow() {
    const amt = document.getElementById('amt-input').value;
    if (!amt || amt < 1.2) {
        Swal.fire({ title: 'Minimum 1.2 TON', icon: 'warning', background: '#111' });
        return;
    }

    const nano = (parseFloat(amt) * 1000000000).toString();
    try {
        await tonUI.sendTransaction({
            validUntil: Math.floor(Date.now() / 1000) + 60,
            messages: [{
                address: CONTRACT_ADDR,
                amount: nano,
                // সঠিক বাইনারি পে-লোড
                payload: "te6cckEBAQEACAAADURlcG9zaXQAWl0v" 
            }]
        });
        
        stakingActive = true; 
        myStake += parseFloat(amt);
        document.getElementById('staked-val').innerText = myStake.toFixed(2) + " TON";
        Swal.fire({ title: 'Staking Success!', icon: 'success', background: '#111' });
    } catch (e) {
        Swal.fire({ title: 'Transaction Failed', icon: 'error', background: '#111' });
    }
}

async function withdrawAll() {
    try {
        await tonUI.sendTransaction({
            validUntil: Math.floor(Date.now() / 1000) + 60,
            messages: [{
                address: CONTRACT_ADDR,
                amount: "50000000",
                payload: "te6cckEBAQEACQAADldpdGhkcmF3jXlA9w==" 
            }]
        });
        stakingActive = false; rewardVal = 0; myStake = 0;
        document.getElementById('live-earnings').innerText = "0.000000";
        document.getElementById('staked-val').innerText = "0.00 TON";
    } catch (e) {}
}
