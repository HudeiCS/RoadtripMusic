async function savePlaylistImage(playlistId, image) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("myDatabase", 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      db.createObjectStore("storedImages", { keyPath: "id" });
    };

    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(["storedImages"], "readwrite");
      const store = transaction.objectStore("storedImages");
      const playlistData = { id: playlistId, img: image };
      const addRequest = store.put(playlistData);

      addRequest.onsuccess = () => {
        console.log("Image saved successfully");
        resolve();
      };
      addRequest.onerror = (e) => reject(e.target.error);
    };

    request.onerror = (event) => {
      console.error("Database error:", event.target.errorCode);
      reject(event.target.errorCode);
    };
  });
}

async function getPlaylistImage(playlistId) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("myDatabase", 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      db.createObjectStore("storedImages", { keyPath: "id" });
    };

    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(["storedImages"], "readonly");
      const store = transaction.objectStore("storedImages");
      const getRequest = store.get(playlistId);

      getRequest.onsuccess = () => {
        if (getRequest.result) {
          resolve(URL.createObjectURL(getRequest.result.img));
        } else {
          resolve(null);
        }
      };
      getRequest.onerror = (e) => reject(e.target.error);
    };

    request.onerror = (event) => reject(event.target.errorCode);
  });
}