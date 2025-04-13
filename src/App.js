import axios from "axios";
import { useState } from "react";
import * as XLSX from "xlsx";

function App() {
  const [msg, setMsg] = useState("");
  const [status, setStatus] = useState(false);
  const [emailList, setEmailList] = useState([]);

  function handleMsg(evt) {
    setMsg(evt.target.value);
  }

  function handleFile(event) {
    const file = event.target.files[0];
    if (!file) {
      alert("No file selected.");
      return;
    }

    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      alert("Please upload a valid Excel file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const emails = XLSX.utils.sheet_to_json(worksheet, { header: "A" });
      const totalEmails = emails.map((item) => item.A);
      setEmailList(totalEmails);
    };

    reader.readAsBinaryString(file);
  }

  function send() {
    if (!msg.trim()) {
      alert("Message cannot be empty.");
      return;
    }

    if (emailList.length === 0) {
      alert("Please upload a file with emails.");
      return;
    }

    setStatus(true);

    axios
      .post("https://bulkmail-backend-h49k.onrender.com/sendemail", { msg, emailList })
      .then((res) => {
        if (res.data.success) {
          alert("Emails sent successfully!");
        } else {
          alert("Failed to send emails: " + res.data.message);
        }
      })
      .catch((err) => {
        console.error(err);
        alert("An error occurred while sending emails.");
      })
      .finally(() => {
        setStatus(false);
      });
  }

  return (
    <div>
      <div className="bg-blue-950 text-white text-center">
        <h1 className="text-2xl font-medium px-5 py-3">BulkMail</h1>
      </div>

      <div className="bg-blue-800 text-white text-center">
        <h1 className="font-medium px-5 py-3">
        We can help your business send multiple emails at once
        </h1>
      </div>

      <div className="bg-blue-600 text-white text-center">
        <h1 className="font-medium px-5 py-3">Upload Excel File</h1>
      </div>

      <div className="bg-blue-400 flex flex-col items-center text-black px-5 py-3">
        <textarea
          onChange={handleMsg}
          value={msg}
          className="w-[80%] h-32 py-2 outline-none px-2 border border-black rounded-md"
          placeholder="Enter the email text..."
        ></textarea>

        <input
          type="file"
          onChange={handleFile}
          className="border-4 border-dashed py-4 px-4 mt-5 mb-5"
        />

        <p>Total Emails in the file: {emailList.length}</p>

        <ul className="text-sm text-gray-700 mt-2">
          {emailList.slice(0, 5).map((email, i) => (
            <li key={i}>- {email}</li>
          ))}
        </ul>

        <button
          onClick={send}
          disabled={status}
          className="mt-4 bg-blue-950 py-2 px-4 text-white font-medium rounded-md w-fit"
        >
          {status ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}

export default App;
