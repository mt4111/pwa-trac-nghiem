"use client"; // Bắt buộc để chạy trên trình duyệt

import { useState } from 'react';
import Tesseract from 'tesseract.js';
import { db } from './firebase'; // Gọi cái kho dữ liệu bạn tạo ở Bước 4
import { collection, addDoc } from 'firebase/firestore'; 

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0); // Thanh phần trăm quét
  const [rawText, setRawText] = useState("");
  const [questions, setQuestions] = useState([]);

  // 1. Hàm xử lý khi chọn ảnh
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setProgress(0);

    // Bắt đầu quét ảnh (Tiếng Việt)
    Tesseract.recognize(
      file,
      'vie', 
      { logger: m => {
          if(m.status === 'recognizing text') {
            setProgress(parseInt(m.progress * 100));
          }
        } 
      }
    ).then(({ data: { text } }) => {
      setRawText(text);
      convertTextToQuiz(text); // Tự động tách câu hỏi
      setLoading(false);
    });
  };

  // 2. Hàm tách văn bản thành câu hỏi (Logic thay thế AI)
  const convertTextToQuiz = (text) => {
    // Logic: Tách dòng, tìm từ khóa "Câu", "A.", "B."
    const lines = text.split('\n');
    let generatedQuestions = [];
    let currentQ = null;

    lines.forEach(line => {
      const cleanLine = line.trim();
      // Nếu dòng bắt đầu bằng "Câu [số]"
      if (cleanLine.match(/^Câu\s+\d+/i) || cleanLine.match(/^\d+\./)) {
        if (currentQ) generatedQuestions.push(currentQ); // Lưu câu cũ
        currentQ = { 
          question: cleanLine, 
          options: [], 
          correctAnswer: "" 
        };
      } 
      // Nếu dòng bắt đầu bằng đáp án A. B. C. D.
      else if (cleanLine.match(/^[A-D]\./) && currentQ) {
        currentQ.options.push(cleanLine);
      }
      // Nếu là nội dung câu hỏi (nối vào câu hỏi)
      else if (currentQ && currentQ.options.length === 0) {
        currentQ.question += " " + cleanLine;
      }
    });
    // Đẩy câu cuối cùng vào
    if (currentQ) generatedQuestions.push(currentQ);

    setQuestions(generatedQuestions);
  };

  // 3. Hàm lưu lên Firebase
  const saveToFirebase = async () => {
    if (questions.length === 0) {
      alert("Chưa có câu hỏi nào để lưu!");
      return;
    }

    try {
      // Lưu vào bảng tên là 'de-thi'
      const docRef = await addDoc(collection(db, "de-thi"), {
        title: "Đề thi mới " + new Date().toLocaleString(),
        questions: questions,
        createdAt: new Date()
      });
      alert("Đã lưu thành công! ID: " + docRef.id);
    } catch (e) {
      console.error("Lỗi lưu: ", e);
      alert("Lỗi: " + e.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
        <h1 className="text-2xl font-bold text-center mb-6 text-blue-600">Máy Quét Đề Thi PWA</h1>
        
        {/* Nút chọn ảnh */}
        <div className="mb-6">
          <label className="block mb-2 font-medium">1. Chọn ảnh đề thi:</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {/* Thanh tiến trình loading */}
        {loading && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-1">Đang đọc chữ: {progress}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{width: `${progress}%`}}></div>
            </div>
          </div>
        )}

        {/* Kết quả sau khi quét */}
        {questions.length > 0 && (
          <div className="mb-6">
            <h2 className="font-bold mb-2">2. Kết quả nhận diện ({questions.length} câu):</h2>
            <div className="max-h-60 overflow-y-auto border p-2 text-sm bg-gray-50 rounded">
              {questions.map((q, i) => (
                <div key={i} className="mb-2 border-b pb-2">
                  <p className="font-semibold text-red-500">{q.question}</p>
                  <ul className="pl-4">
                    {q.options.map((opt, k) => <li key={k}>{opt}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Nút lưu */}
        <button 
          onClick={saveToFirebase}
          disabled={questions.length === 0}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400 transition"
        >
          3. Lưu Đề Thi Lên Mạng
        </button>
      </div>
    </div>
  );
}
