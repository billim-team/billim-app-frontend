// =============================================
// Billim API & WebSocket 유틸리티
// 백엔드: Django REST Framework + Django Channels
// =============================================

const BASE_URL = "/api";
const WS_BASE  = "https://dreadful-small-deprecate.ngrok-free.dev/";
// ── 공통 fetch 래퍼 ──────────────────────────
async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("billim_token");
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
      ...(token ? { Authorization: `Token ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw { status: res.status, detail: err };
  }

  // 204 No Content
  if (res.status === 204) return null;
  return res.json();
}

// ── 인증 ─────────────────────────────────────
export const authAPI = {
  login:    (data) => apiFetch("/accounts/login/",    { method: "POST", body: JSON.stringify(data) }),
  register: (data) => apiFetch("/accounts/register/", { method: "POST", body: JSON.stringify(data) }),
  logout:   ()     => apiFetch("/accounts/logout/",   { method: "POST" }),
  me:       ()     => apiFetch("/accounts/my-settings/"),
};

// ── 물품 ─────────────────────────────────────
export const itemAPI = {
  list:   (params = "") => apiFetch(`/items/${params}`),
  detail: (id)          => apiFetch(`/items/${id}/`),
  create: (data)        => apiFetch("/items/",     { method: "POST", body: JSON.stringify(data) }),
  update: (id, data)    => apiFetch(`/items/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id)          => apiFetch(`/items/${id}/`, { method: "DELETE" }),
};

// ── 예약 [단계 1] ─────────────────────────────
// POST /items/bookings/
// → 예약 생성 + SYSTEM 팝업 웹소켓 브로드캐스팅
export const bookingAPI = {
  create: (data) => apiFetch("/items/rentals/", {
    method: "POST",
    body: JSON.stringify(data),
    // data: { item, start_date, end_date }
  }),

  // [단계 2] 제공자 승인/거절
  // POST /items/bookings/{id}/action/
  // → APPROVE: PAY_FORM 팝업 / REJECT: SYSTEM 팝업
  action: (bookingId, data) => apiFetch(`/items/rentals/${bookingId}/action/`, {
    method: "POST",
    body: JSON.stringify(data),
    // data: { action: 'APPROVE' | 'REJECT', reject_reason?: string }
  }),

  // [단계 3] 결제 완료
  // POST /items/bookings/{id}/payment-complete/
  // → PAY_COMPLETE 팝업 브로드캐스팅
  paymentComplete: (bookingId) => apiFetch(`/items/rentals/${bookingId}/payment-complete/`, {
    method: "POST",
    body: JSON.stringify({}),
  }),
};

// ── 채팅 메시지 REST ──────────────────────────
export const chatAPI = {
  messages: (roomId) => apiFetch(`/items/chats/${roomId}/`),
  send:     (roomId, data) => apiFetch(`/items/chats/${roomId}/`, {
    method: "POST",
    body: JSON.stringify(data),
    // data: { content: string }
  }),
};

// ── WebSocket 연결 클래스 ─────────────────────
// ws://host/ws/chat/{room_id}/
// message_type: TALK | SYSTEM | PAY_FORM | PAY_COMPLETE
export class BillimWebSocket {
  constructor(roomId, handlers = {}) {
    this.roomId   = roomId;
    this.handlers = handlers; // { onMessage, onOpen, onClose, onError }
    this.ws       = null;
    this.reconnectTimer = null;
    this.shouldReconnect = true;
  }

  connect() {
    const token = localStorage.getItem("billim_token");
    const url   = `${WS_BASE}/ws/chat/${this.roomId}/${token ? `?token=${token}` : ""}`;
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log(`[WS] 채팅방 ${this.roomId} 연결됨`);
      this.handlers.onOpen?.();
    };

    this.ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        // data: { message_type, message, sender }
        this.handlers.onMessage?.(data);
      } catch {
        console.warn("[WS] 파싱 오류:", e.data);
      }
    };

    this.ws.onerror = (err) => {
      console.error("[WS] 오류:", err);
      this.handlers.onError?.(err);
    };

    this.ws.onclose = (e) => {
      console.log(`[WS] 연결 종료 (code: ${e.code})`);
      this.handlers.onClose?.(e);
      // 비정상 종료 시 재연결
      if (this.shouldReconnect && e.code !== 1000) {
        this.reconnectTimer = setTimeout(() => this.connect(), 3000);
      }
    };
  }

  // 일반 채팅 메시지 전송 (TALK)
  sendMessage(content) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ message: content }));
    }
  }

  disconnect() {
    this.shouldReconnect = false;
    clearTimeout(this.reconnectTimer);
    this.ws?.close(1000, "정상 종료");
  }

  get isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}