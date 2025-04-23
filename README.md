# EZTax
**README.md**

```markdown
# EZTax WebApp

EZTax is a feature-rich web application designed to simplify financial tasks and tax-related processes. It integrates multiple advanced components such as a chatbot, recommendation system, and OCR (Optical Character Recognition) capabilities to provide users with a seamless, AI-driven experience. By leveraging Function.Network’s API and Google Gemini’s generative capabilities, the platform offers intelligent data extraction, tax optimization, and personalized financial insights.

---

## 🔹 Features

- ✅ **Intelligent Chatbot (Tax Assistant):**  
  - Provides quick, accurate responses to tax-related questions.  
  - Integrates FAISS-based vector search for document retrieval.  
  - Leverages Function.Network’s API for conversational tasks and fallback queries.  

- ✅ **Advanced Recommendation System:**  
  - Uses user-provided financial data to suggest tax-saving investments.  
  - Calculates tax liabilities under both old and new tax regimes.  
  - Provides detailed, actionable insights based on Indian tax laws.  

- ✅ **OCR and Document Parsing:**  
  - Extracts key financial information from uploaded documents such as salary slips, investment statements, and invoices.  
  - Highlights important text regions with bounding boxes.  
  - Processes images efficiently using EasyOCR and enhanced preprocessing techniques.  

---

## 📊 How It Works

1. **User Input:**  
   - Upload financial documents (e.g., salary slips, investment proofs).  
   - Provide basic user details and financial data.  

2. **OCR and Data Extraction:**  
   - The OCR system identifies text within the documents, categorizes financial data, and extracts fields such as total amount, date, payment method, and tax-related identifiers.  
   - Annotated images with bounding boxes are generated for transparency and verification.  

3. **Chatbot Interaction:**  
   - The chatbot answers questions by retrieving relevant data from indexed documents.  
   - For queries requiring additional insights, it uses Function.Network’s API to generate comprehensive responses.  

4. **Recommendation System:**  
   - Analyzes extracted data and user inputs to compute tax liabilities under different regimes.  
   - Suggests tax-efficient investments and identifies potential savings.  
   - Outputs personalized, formatted reports.  

---

## 🛠 Tech Stack

- **Backend Frameworks:** Flask, FastAPI  
- **Frontend (if applicable):** React or Next.js (not included in the code provided, but suggested for UI)  
- **AI/ML Models:** Google Gemini API (via Function.Network), HuggingFace Embeddings, FAISS for semantic search  
- **OCR Tools:** EasyOCR, OpenCV for preprocessing  
- **Data Storage:** Local FAISS index for vector search  
- **Environment Management:** Python-dotenv for environment variables  

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/EZTax.git
cd EZTax
```

### 2. Install Dependencies

**Backend:**
```bash
pip install -r requirements.txt
```

**Frontend (if applicable):**
```bash
cd frontend
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
FUNCTION_API_KEY=your_function_network_api_key
GEMINI_API_KEY_2=your_gemini_api_key
```

**Note:** The provided code explicitly uses Function.Network’s API, so ensure that `FUNCTION_API_KEY` is correctly set in the environment file.

### 4. Run the Backend

```bash
uvicorn main:app --reload
```

**Alternative (if using Flask):**
```bash
flask run
```

**API Access:**  
- Open `http://127.0.0.1:8000/docs` (if using FastAPI) to view the API documentation.  
- Use the `/chat` endpoint for the chatbot and the `/generate-report` endpoint for financial insights.

---

## 📊 Outputs

- **Chatbot Responses:**  
  - Instant answers to tax queries.  
  - Fallback to Function.Network’s API for additional insights.  

- **Extracted OCR Data:**  
  - Annotated images with text bounding boxes.  
  - JSON-formatted text fields from documents.  

- **Recommendation Reports:**  
  - Tax liability under old and new regimes.  
  - Personalized investment suggestions.  
  - Clear, structured financial summaries.  

---

## 📝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository.  
2. Create a new branch (`git checkout -b feature-branch`).  
3. Commit your changes and push to your fork.  
4. Submit a pull request for review.

---

**Star this project if you find it useful! ⭐️**
```
