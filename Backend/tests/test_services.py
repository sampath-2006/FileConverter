import os
import pytest
from services.conversion_service import master_convert, convert_image
from services.document_service import convert_document
from services.video_audio_service import convert_media
from services.ai_service import load_document, process_with_langchain
from services.pdf_toolkit_service import merge_pdfs, split_pdf, compress_pdf, protect_pdf, unlock_pdf, redact_pdf, sign_pdf

def test_convert_image(dummy_image, temp_dir):
    output_path = os.path.join(temp_dir, 'output.png')
    success, msg, path = convert_image(dummy_image, output_path, 'PNG')
    assert success is True
    assert path == output_path
    assert os.path.exists(output_path)

def test_convert_image_invalid():
    # Should fail due to non-existent file
    success, msg, path = convert_image('invalid.jpg', 'out.jpg', 'JPG')
    assert success is False

def test_convert_document_single_page_pdf(dummy_single_page_pdf, temp_dir):
    output_path = os.path.join(temp_dir, 'output.jpg')
    success, msg, path = convert_document(dummy_single_page_pdf, output_path, 'JPG')
    assert success is True
    assert path == output_path
    assert os.path.exists(output_path)

def test_convert_document_multi_page_pdf(dummy_multi_page_pdf, temp_dir):
    output_path = os.path.join(temp_dir, 'output.jpg')
    success, msg, path = convert_document(dummy_multi_page_pdf, output_path, 'JPG')
    assert success is True
    # Path should be updated to .zip
    assert path.endswith('.zip')
    assert os.path.exists(path)

def test_convert_document_docx(dummy_single_page_pdf, temp_dir):
    output_path = os.path.join(temp_dir, 'output.docx')
    success, msg, path = convert_document(dummy_single_page_pdf, output_path, 'DOCX')
    assert success is True
    assert os.path.exists(output_path)

def test_convert_document_invalid_target(dummy_single_page_pdf, temp_dir):
    success, msg, path = convert_document(dummy_single_page_pdf, 'out.txt', 'TXT')
    assert success is False
    assert "Unsupported target format" in msg

def test_convert_document_unsupported_ext(dummy_text_file, temp_dir):
    success, msg, path = convert_document(dummy_text_file, 'out.jpg', 'JPG')
    assert success is False
    assert "not fully implemented yet" in msg

def test_convert_document_exception():
    success, msg, path = convert_document("invalid.pdf", "out.jpg", "JPG")
    assert success is False

def test_master_convert_image(dummy_image, temp_dir):
    out = os.path.join(temp_dir, 'out.png')
    success, msg, path = master_convert(dummy_image, out, 'png')
    assert success is True

def test_master_convert_document(dummy_single_page_pdf, temp_dir):
    out = os.path.join(temp_dir, 'out.jpg')
    success, msg, path = master_convert(dummy_single_page_pdf, out, 'jpg')
    assert success is True

def test_master_convert_unsupported():
    success, msg = master_convert('file.unknown', 'out.jpg', 'jpg')
    assert success is False
    assert "Unsupported file category" in msg

def test_ai_service_load_document(dummy_text_file):
    text = load_document(dummy_text_file)
    assert text == "This is a dummy text file."

def test_ai_service_load_document_pdf(dummy_single_page_pdf):
    text = load_document(dummy_single_page_pdf)
    assert "Test Page" in text

def test_ai_service_load_document_invalid(dummy_image):
    with pytest.raises(ValueError):
        load_document(dummy_image)

def test_ai_service_process_no_api_key(dummy_text_file, temp_dir, monkeypatch):
    import config
    monkeypatch.setattr(config.Config, 'GROQ_API_KEY', None)
    out = os.path.join(temp_dir, 'ai_out.txt')
    success, msg = process_with_langchain(dummy_text_file, out, "Summarize")
    assert success is False
    assert "GROQ_API_KEY is not configured" in msg

def test_ai_service_process_success(dummy_text_file, temp_dir, mocker):
    out = os.path.join(temp_dir, 'ai_out.txt')
    
    # Mock Langchain to avoid real API calls
    mock_parser = mocker.patch('services.ai_service.StrOutputParser')
    mock_chain = mocker.MagicMock()
    mock_chain.invoke.return_value = "Mock Summary Response"
    
    # We have to mock the `|` operator chain. Easiest way is to patch ChatPromptTemplate or ChatGroq
    mocker.patch('services.ai_service.ChatGroq', return_value=mocker.MagicMock())
    
    # A cleaner way: Mock the whole build chain step or just patch ChatGroq's invoke if possible.
    # Actually, the pipe syntax `prompt | llm | parser` builds a RunnableSequence. 
    # Let's mock the `chain.invoke` directly by patching ChatPromptTemplate.from_messages to return a mock that overrides __or__.
    class MockChain:
        def __or__(self, other):
            return self
        def invoke(self, inputs):
            return "Mock Summary Response"
            
    mocker.patch('services.ai_service.ChatPromptTemplate.from_messages', return_value=MockChain())
    
    success, msg = process_with_langchain(dummy_text_file, out, "Summarize")
    assert success is True
    with open(out, 'r') as f:
        assert f.read() == "Mock Summary Response"

def test_ai_service_empty_text(temp_dir):
    empty = os.path.join(temp_dir, 'empty.txt')
    open(empty, 'w').close()
    out = os.path.join(temp_dir, 'out.txt')
    success, msg = process_with_langchain(empty, out, "Sum")
    assert success is False
    assert "Could not extract any text" in msg

def test_pdf_toolkit_merge(dummy_single_page_pdf, temp_dir):
    out = os.path.join(temp_dir, 'merged.pdf')
    success, msg = merge_pdfs([dummy_single_page_pdf, dummy_single_page_pdf], out)
    assert success is True
    assert os.path.exists(out)

def test_pdf_toolkit_merge_exception():
    success, msg = merge_pdfs(["non_existent.pdf"], "out.pdf")
    assert success is False

def test_pdf_toolkit_split(dummy_multi_page_pdf, temp_dir):
    out = os.path.join(temp_dir, 'split.pdf')
    success, msg = split_pdf(dummy_multi_page_pdf, out, 1, 1)
    assert success is True
    assert os.path.exists(out)

def test_pdf_toolkit_split_invalid_range(dummy_multi_page_pdf, temp_dir):
    out = os.path.join(temp_dir, 'split.pdf')
    success, msg = split_pdf(dummy_multi_page_pdf, out, 5, 10)
    assert success is False
    assert "Invalid page range" in msg

def test_pdf_toolkit_compress(dummy_single_page_pdf, temp_dir):
    out = os.path.join(temp_dir, 'compressed.pdf')
    success, msg = compress_pdf(dummy_single_page_pdf, out)
    assert success is True
    assert os.path.exists(out)

def test_pdf_toolkit_protect_and_unlock(dummy_single_page_pdf, temp_dir):
    protected = os.path.join(temp_dir, 'protected.pdf')
    unlocked = os.path.join(temp_dir, 'unlocked.pdf')
    
    success, msg = protect_pdf(dummy_single_page_pdf, protected, "password123")
    assert success is True
    
    success, msg = unlock_pdf(protected, unlocked, "password123")
    assert success is True

def test_pdf_toolkit_redact(dummy_single_page_pdf, temp_dir):
    out = os.path.join(temp_dir, 'redacted.pdf')
    success, msg = redact_pdf(dummy_single_page_pdf, out, "Test")
    assert success is True

def test_pdf_toolkit_sign(dummy_single_page_pdf, dummy_image, temp_dir):
    out = os.path.join(temp_dir, 'signed.pdf')
    success, msg = sign_pdf(dummy_single_page_pdf, dummy_image, out)
    assert success is True
