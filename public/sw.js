self.addEventListener("install", (event) => {
  self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  self.clients.claim();
});
// 必要になったら fetch イベントでキャッシュ戦略を追加できます
