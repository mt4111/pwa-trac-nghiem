// 1. Nhập thư viện Firebase (StackBlitz tự hiểu)
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// 2. Dán đoạn mã bạn vừa copy từ Firebase vào thay cho đoạn bên dưới
// --- BẮT ĐẦU ĐOẠN CẦN THAY ---
const firebaseConfig = {
  apiKey: "AIzaSyAXVAIQAfHwyz2kGjYMlYipQJiOufnrvYQ",
  authDomain: "wed-trac-nghiem.firebaseapp.com",
  projectId: "wed-trac-nghiem",
  storageBucket: "wed-trac-nghiem.firebasestorage.app",
  messagingSenderId: "826848573115",
  appId: "1:826848573115:web:f821e2da08ec082e365b9e",
  measurementId: "G-017RJ1RYG9"
};
// --- KẾT THÚC ĐOẠN CẦN THAY ---

// 3. Khởi động Firebase
const app = initializeApp(firebaseConfig);

// 4. Xuất cái "kho dữ liệu" ra để các trang khác dùng
export const db = getFirestore(app);
