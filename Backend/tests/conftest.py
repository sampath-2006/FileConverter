import pytest
import os
import tempfile
import fitz
from PIL import Image
from app import create_app

@pytest.fixture
def app():
    app = create_app()
    app.config.update({
        "TESTING": True,
        "UPLOAD_FOLDER": tempfile.mkdtemp(),
        "CONVERTED_FOLDER": tempfile.mkdtemp()
    })
    yield app

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def temp_dir():
    with tempfile.TemporaryDirectory() as tmpdirname:
        yield tmpdirname

@pytest.fixture
def dummy_image(temp_dir):
    path = os.path.join(temp_dir, 'dummy.jpg')
    img = Image.new('RGB', (100, 100), color='red')
    img.save(path)
    return path

@pytest.fixture
def dummy_single_page_pdf(temp_dir):
    path = os.path.join(temp_dir, 'single.pdf')
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text(fitz.Point(50, 50), "Test Page")
    doc.save(path)
    doc.close()
    return path

@pytest.fixture
def dummy_multi_page_pdf(temp_dir):
    path = os.path.join(temp_dir, 'multi.pdf')
    doc = fitz.open()
    page1 = doc.new_page()
    page1.insert_text(fitz.Point(50, 50), "Page 1")
    page2 = doc.new_page()
    page2.insert_text(fitz.Point(50, 50), "Page 2")
    doc.save(path)
    doc.close()
    return path

@pytest.fixture
def dummy_text_file(temp_dir):
    path = os.path.join(temp_dir, 'dummy.txt')
    with open(path, 'w') as f:
        f.write("This is a dummy text file.")
    return path
