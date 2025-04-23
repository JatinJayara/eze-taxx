"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import SidebarComponent from "../../components/layout/Sidebar";
import { IoSend } from "react-icons/io5";

const ReportList = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiReport, setAIReport] = useState(null);
  const [activeReportId, setActiveReportId] = useState(null);

  // Chatbot states
  const [userMessage, setUserMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);

  const fetchReports = async () => {
    try {
      const res = await axios.get("/api/extractedData");
      setReports(res.data.data);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to load report data.");
    } finally {
      setLoading(false);
    }
  };

  const generateAIReport = async (data) => {
    try {
      const res = await axios.post("/api/aiReport", data); // Proxy route
      return res.data;
    } catch (error) {
      console.error("Failed to generate report:", error);
      toast.error("Error generating report.");
      return null;
    }
  };
  
  const handleGenerateReport = async (report) => {
    setActiveReportId(report._id);
    setAIReport(null); // Reset any previous report
    setChatHistory([]); // Reset chat history when a new report is selected
    
    toast.loading("Generating AI report...");
    const result = await generateAIReport(report.extracted);
    toast.dismiss();
    
    if (result) {
      setAIReport(result);
      toast.success("AI report generated!");
      
      // Initialize chat with a welcome message when report is generated
      setChatHistory([
        { 
          sender: "bot", 
          text: "Your tax report is ready! Ask me any questions about your tax calculations or recommendations for tax optimization." 
        }
      ]);
    }
  };

  const sendMessage = async () => {
    if (!userMessage.trim()) return;

    const newHistory = [...chatHistory, { sender: "user", text: userMessage }];
    setChatHistory(newHistory);
    
    try {
      // Include the tax report data in the API call to provide context
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          message: userMessage,
          taxData: aiReport ? aiReport : null,
          userData: reports.find(report => report._id === activeReportId)?.extracted || {}
        }),
      });

      const data = await res.json();
      setChatHistory((prev) => [
        ...prev,
        { sender: "bot", text: data.answer || "Sorry, I couldn't understand." },
      ]);
    } catch (err) {
      console.error("Frontend error:", err);
      setChatHistory((prev) => [
        ...prev,
        { sender: "bot", text: "There was an error. Please try again." },
      ]);
    }

    setUserMessage("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SidebarComponent />
      <div className="flex-1 p-8 montserrat-font-medium">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="min-w-4xl mx-auto mt-10">
            <h2 className="text-6xl my-4 text-blue-500">
              Your Extracted Reports
            </h2>

            {loading ? (
              <p className="text-gray-500">Loading reports...</p>
            ) : reports.length === 0 ? (
              <p className="text-gray-500">No reports found.</p>
            ) : (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {reports.map((report, index) => (
                  <div
                    key={report._id || index}
                    className="border rounded-2xl p-4 shadow hover:shadow-lg transition bg-white"
                  >
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      Document Type:{" "}
                      <span className="capitalize">
                        {report.documentType || "unknown"}
                      </span>
                    </h3>

                    <div className="bg-gray-50 text-sm p-4 rounded max-h-[400px] overflow-auto space-y-2">
                      {report.extracted &&
                      typeof report.extracted === "object" ? (
                        Object.entries(report.extracted).map(
                          ([key, value]) => (
                            <div
                              key={key}
                              className="flex justify-between items-start border-b py-1"
                            >
                              <span className="font-medium text-gray-700 capitalize w-1/3 break-words">
                                {key}
                              </span>
                              <span className="text-gray-600 w-2/3 text-right break-words font-mono">
                                {value === null || value === undefined
                                  ? "—"
                                  : typeof value === "object"
                                  ? JSON.stringify(value, null, 2)
                                  : value.toString()}
                              </span>
                            </div>
                          )
                        )
                      ) : (
                        <p className="text-gray-400 italic">
                          No extracted data available.
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleGenerateReport(report)}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                      Generate AI Report
                    </button>

                    {activeReportId === report._id && aiReport && (
                      <div className="mt-4 p-4 bg-blue-50 rounded border border-blue-200">
                        <h4 className="font-semibold text-blue-700 mb-2">
                          AI Tax Report:
                        </h4>
                        <p>
                          <strong>Total Income:</strong> ₹
                          {aiReport.total_income}
                        </p>
                        <p>
                          <strong>Tax (Old Regime):</strong> ₹
                          {aiReport.total_tax_old}
                        </p>
                        <p>
                          <strong>Tax (New Regime):</strong> ₹
                          {aiReport.total_tax_new}
                        </p>
                        <p>
                          <strong>Refund/Due (Old):</strong> ₹
                          {aiReport.tax_due_or_refund_old}
                        </p>
                        <p>
                          <strong>Refund/Due (New):</strong> ₹
                          {aiReport.tax_due_or_refund_new}
                        </p>
                        <div className="mt-2">
                          <h5 className="font-semibold">
                            Investment Insights:
                          </h5>
                          <pre className="whitespace-pre-wrap text-sm text-gray-700 mt-1">
                            {aiReport.investment_insights}
                          </pre>
                        </div>
                        
                        {/* Chatbot section - Added similar to TaxDashboard component */}
                        <div className="mt-6 border-t pt-4">
                          <h5 className="font-semibold text-blue-700 mb-2">
                            Ask Tax Bot
                          </h5>
                          
                          {/* Chat History */}
                          <div className="bg-white p-4 rounded-lg mb-4 max-h-60 overflow-y-auto border border-gray-200">
                            {chatHistory.map((msg, i) => (
                              <div
                                key={i}
                                className={`mb-3 ${
                                  msg.sender === "user" ? "text-right" : "text-left"
                                }`}
                              >
                                <div 
                                  className={`inline-block px-3 py-2 rounded-lg max-w-[80%] text-sm ${
                                    msg.sender === "user" 
                                      ? "bg-blue-100 text-blue-800" 
                                      : "bg-gray-50 border border-gray-200 text-gray-800"
                                  }`}
                                >
                                  {msg.text}
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {/* Input Area */}
                          <div className="flex gap-2">
                            <input
                              value={userMessage}
                              onChange={(e) => setUserMessage(e.target.value)}
                              onKeyDown={handleKeyDown}
                              className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Ask about your tax report..."
                            />
                            <button
                              onClick={sendMessage}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                            >
                              <IoSend />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-gray-400 mt-3">
                      Uploaded on:{" "}
                      {new Date(report.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportList;