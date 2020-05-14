let db;

const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function(e) {
    const db = e.target.result;
    db.createObjectStore("pending", {autoIncrement: true});
}

request.onsuccess = function(e) {
    db = e.target.result;
    
    if (navigator.online) {
    checkDatabase();
    }
}

request.onerror = function(e) {
    console.log("error:", e.target.errorCode);
}

function saveRecord(data) {
    // create readwrite capable transaction
    const transaction = db.transaction(["pending"], "readwrite");

    // open objectstore
    const store = transaction.objectStore("pending");

    // add data to "pending" objectStore
    store.add(data);
}

function checkDatabase() {
    // create readwrite capable transaction
    const store = transaction.objectStore("pending");

    // open objectstore
    const store = transaction.objectStore("pending");

    // create variable containing all records from "pending"
    const allData = store.getAll();

    allData.onsuccess = function() {
        if (allData.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(allData.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
            .then(response => response.json())
            .then(() => {
                // upon success open readwrite transaction on "pending"
                const transaction = db.transaction(["pending"], "readwrite");
                // access objectStore
                const store = transaction.objectStore("pending");
                // clear objectStore
                store.clear()
            })
        }
    }
}

// listen for app back online
window.addEventListener("online", checkDatabase)