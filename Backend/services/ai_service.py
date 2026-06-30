import os
from config import Config
from langchain_groq import ChatGroq
from langchain_community.document_loaders import PyMuPDFLoader, TextLoader
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

def load_document(filepath):
    """
    Uses LangChain Document Loaders to extract text.
    Returns a single combined string of all page content.
    """
    ext = filepath.rsplit('.', 1)[1].lower()
    
    if ext == 'pdf':
        loader = PyMuPDFLoader(filepath)
    elif ext == 'txt':
        loader = TextLoader(filepath, encoding='utf-8')
    else:
        raise ValueError(f"LangChain loader for {ext} is not supported yet.")
        
    documents = loader.load()
    # Combine all pages into one large string
    full_text = "\n\n".join([doc.page_content for doc in documents])
    
    return full_text.strip()

def process_with_langchain(input_path, output_path, instruction):
    """
    1. Loads the document using LangChain.
    2. Builds an LCEL chain (Prompt | LLM | Parser).
    3. Invokes the chain and saves the output.
    """
    try:
        if not Config.GROQ_API_KEY:
            return False, "GROQ_API_KEY is not configured in the backend environment."
            
        # 1. Extract Text
        document_text = load_document(input_path)
        
        if not document_text:
            return False, "Could not extract any text from the document."
            
        # 2. Initialize Model
        llm = ChatGroq(
            temperature=0, 
            groq_api_key=Config.GROQ_API_KEY, 
            model_name="llama-3.1-70b-versatile"
        )
        
        # 3. Create Prompt Template
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are a highly intelligent and professional document analysis assistant."),
            ("human", "{instruction}\n\nDOCUMENT CONTENT:\n{document_text}")
        ])
        
        # 4. Build LCEL Chain
        chain = prompt | llm | StrOutputParser()
        
        # 5. Execute Chain
        response_text = chain.invoke({
            "instruction": instruction,
            "document_text": document_text
        })
        
        # 6. Save to output
        with open(output_path, 'w', encoding='utf-8') as f_out:
            f_out.write(response_text)
            
        return True, "LangChain processing successful"
        
    except Exception as e:
        return False, f"LangChain Error: {str(e)}"
