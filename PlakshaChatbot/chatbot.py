import os
import time
import google.generativeai as genai
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory
from dotenv import load_dotenv

# ✅ Load environment variables
load_dotenv(r"C:\Users\AkshatSaraswat\Desktop\Plaksha\.env")  # removed trailing space

api_key = os.getenv("GEMINI_API_KEY_2")
if not api_key:
    raise ValueError("❌ ERROR: GEMINI_API_KEY_2 is not set in the .env file!")

os.environ["GOOGLE_API_KEY"] = api_key

# ✅ Initialize Gemini
llm = ChatGoogleGenerativeAI(model="gemini-1.5-pro-latest", temperature=0.7)

# ✅ Load PDFs
pdf_folder = r"C:\Users\AkshatSaraswat\Desktop\Plaksha\PlakshaChatbot\tax_pdfs"
if not os.path.exists(pdf_folder):
    raise FileNotFoundError(f"❌ Folder not found: {pdf_folder}")

pdf_files = [os.path.join(pdf_folder, f) for f in os.listdir(pdf_folder) if f.endswith('.pdf')]
if not pdf_files:
    raise FileNotFoundError(f"❌ No PDF files found in {pdf_folder}")

docs = []
for pdf_file in pdf_files:
    loader = PyPDFLoader(pdf_file)
    docs.extend(loader.load())

print(f"✅ Loaded {len(docs)} documents from {pdf_folder}")

# ✅ Split and index
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
chunks = text_splitter.split_documents(docs)
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
vectorstore = FAISS.from_documents(chunks, embeddings)
vectorstore.save_local("faiss_index")

memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True, max_token_limit=500)

# ✅ Check if query is finance/tax-related
def is_finance_tax_related(query):
    keywords = [
        "tax", "gst", "income", "itr", "capital gain", "deduction",
        "filing", "assessment", "refund", "audit", "financial year",
        "finance", "exemption", "tds", "income tax", "taxable", "section", "investment"
    ]
    query_lower = query.lower()
    return any(kw in query_lower for kw in keywords)

# ✅ Retry Gemini on failure
def call_gemini_with_retry(query, max_retries=3):
    for attempt in range(max_retries):
        try:
            return llm.predict(query)
        except Exception as e:
            if "429" in str(e):
                wait_time = 2 ** attempt
                print(f"⏳ Rate limit reached. Retrying in {wait_time} seconds...")
                time.sleep(wait_time)
            else:
                print(f"❌ API Error: {e}")
                return "Sorry, I encountered an error processing your request."
    return "I am currently experiencing issues. Please try again later."

# ✅ Main logic to get answer
def get_answer(query):
    retriever = vectorstore.as_retriever(search_type="similarity", search_kwargs={"k": 5})
    retrieved_docs = retriever.invoke(query)

    if retrieved_docs and any(doc.page_content.strip() for doc in retrieved_docs):
        print("🔍 FAISS retrieval successful!")
        qa_chain = ConversationalRetrievalChain.from_llm(llm, retriever=retriever, memory=memory)
        try:
            response = qa_chain.invoke({"question": query, "chat_history": memory.chat_memory})
            faiss_answer = response.get("answer", "").strip()

            if "not mention" in faiss_answer.lower() or "does not contain" in faiss_answer.lower():
                if is_finance_tax_related(query):
                    print("⚠️ FAISS incomplete. Fallback to Gemini (Finance related).")
                    gemini_answer = call_gemini_with_retry(query)
                    return f"{faiss_answer}\n\n🔹 Additional info from Gemini:\n{gemini_answer}"
                else:
                    return "⚠️ I can only answer finance or tax-related queries. Please try again with a relevant question."

            return faiss_answer

        except Exception as e:
            print(f"⚠️ FAISS chain error: {e}")
            if is_finance_tax_related(query):
                return call_gemini_with_retry(query)
            else:
                return "⚠️ I can only answer finance or tax-related queries."

    else:
        print("⚠️ No relevant results in FAISS.")
        if is_finance_tax_related(query):
            return call_gemini_with_retry(query)
        else:
            return "⚠️ I can only answer finance or tax-related queries. Please ask something related to tax or finance."

# ✅ Chat interface
def chat_with_bot():
    print("\n🤖 **Tax Chatbot Ready!** Type 'exit' to stop.\n")
    while True:
        query = input("You: ")
        if query.lower() == "exit":
            print("👋 Exiting chatbot. Have a great day!")
            break
        response = get_answer(query)
        print("Bot:", response)
        
        time.sleep(1.5)

if __name__ == "__main__":
    chat_with_bot()
