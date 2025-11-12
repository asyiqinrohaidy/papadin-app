# papadin-ai/receipt_scanner.py
"""
Computer Vision Receipt Scanner
Uses OpenCV, Tesseract OCR, and image processing to extract stock data from receipts
"""

import cv2
import numpy as np
import pytesseract
import re
from PIL import Image
import io
import base64

class ReceiptScanner:
    """
    Scans and extracts stock information from receipt images
    """
    
    def __init__(self):
        # Common item names to look for
        self.item_patterns = {
            'ayam': ['ayam', 'chicken', 'broiler'],
            'tepung': ['tepung', 'flour', 'wheat'],
            'minyak': ['minyak', 'oil', 'cooking oil'],
            'ais': ['ais', 'ice', 'iced']
        }
        
    def preprocess_image(self, image):
        """
        Preprocess image for better OCR results
        """
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Apply denoising
        denoised = cv2.fastNlMeansDenoising(gray)
        
        # Apply adaptive thresholding
        thresh = cv2.adaptiveThreshold(
            denoised, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
            cv2.THRESH_BINARY, 11, 2
        )
        
        # Dilation and erosion to remove noise
        kernel = np.ones((1, 1), np.uint8)
        processed = cv2.dilate(thresh, kernel, iterations=1)
        processed = cv2.erode(processed, kernel, iterations=1)
        
        return processed
    
    def extract_text(self, image):
        """
        Extract text from preprocessed image using Tesseract OCR
        """
        # Preprocess
        processed = self.preprocess_image(image)
        
        # OCR with custom config
        custom_config = r'--oem 3 --psm 6'
        text = pytesseract.image_to_string(processed, config=custom_config)
        
        return text
    
    def parse_receipt_data(self, text):
        """
        Parse extracted text to find stock items and quantities
        """
        lines = text.split('\n')
        extracted_items = []
        
        for line in lines:
            line_lower = line.lower()
            
            # Try to find item names
            for item_key, patterns in self.item_patterns.items():
                for pattern in patterns:
                    if pattern in line_lower:
                        # Try to extract quantity (numbers in the line)
                        numbers = re.findall(r'\d+', line)
                        if numbers:
                            quantity = int(numbers[0])  # Take first number found
                            extracted_items.append({
                                'item': item_key.capitalize(),
                                'quantity': quantity,
                                'confidence': 0.85,  # Basic confidence
                                'raw_text': line.strip()
                            })
                        break
        
        return extracted_items
    
    def detect_receipt(self, image):
        """
        Detect receipt region in image using edge detection
        """
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        edges = cv2.Canny(blurred, 50, 150)
        
        # Find contours
        contours, _ = cv2.findContours(
            edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
        )
        
        if contours:
            # Find largest contour (likely the receipt)
            largest_contour = max(contours, key=cv2.contourArea)
            x, y, w, h = cv2.boundingRect(largest_contour)
            
            # Crop to receipt region
            receipt_region = image[y:y+h, x:x+w]
            return receipt_region
        
        return image
    
    def scan_receipt(self, image_data, is_base64=False):
        """
        Main function to scan receipt and extract data
        
        Args:
            image_data: Image as numpy array or base64 string
            is_base64: Whether image_data is base64 encoded
            
        Returns:
            Dictionary with extracted items and metadata
        """
        try:
            # Decode if base64
            if is_base64:
                image_bytes = base64.b64decode(image_data.split(',')[1] if ',' in image_data else image_data)
                nparr = np.frombuffer(image_bytes, np.uint8)
                image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            else:
                image = image_data
            
            if image is None:
                return {
                    'success': False,
                    'error': 'Failed to decode image'
                }
            
            # Detect receipt region
            receipt = self.detect_receipt(image)
            
            # Extract text
            text = self.extract_text(receipt)
            
            # Parse for items
            items = self.parse_receipt_data(text)
            
            return {
                'success': True,
                'items': items,
                'raw_text': text,
                'items_found': len(items)
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def validate_extraction(self, items):
        """
        Validate extracted items for reasonableness
        """
        validated = []
        
        for item in items:
            # Check quantity is reasonable (not too high or low)
            if 1 <= item['quantity'] <= 1000:
                validated.append(item)
        
        return validated


# Advanced features
class AdvancedReceiptProcessor:
    """
    Advanced receipt processing with ML-based corrections
    """
    
    def __init__(self):
        self.scanner = ReceiptScanner()
        
    def process_batch(self, images):
        """
        Process multiple receipts at once
        """
        results = []
        
        for image in images:
            result = self.scanner.scan_receipt(image)
            results.append(result)
        
        return results
    
    def correct_ocr_errors(self, text):
        """
        Apply common OCR error corrections
        """
        corrections = {
            '0': 'O',  # Zero to O
            'l': '1',  # lowercase L to 1
            'I': '1',  # uppercase I to 1
        }
        
        corrected = text
        for wrong, right in corrections.items():
            corrected = corrected.replace(wrong, right)
        
        return corrected
    
    def extract_date(self, text):
        """
        Extract date from receipt text
        """
        # Common date patterns
        date_patterns = [
            r'\d{2}/\d{2}/\d{4}',  # DD/MM/YYYY
            r'\d{2}-\d{2}-\d{4}',  # DD-MM-YYYY
            r'\d{4}-\d{2}-\d{2}'   # YYYY-MM-DD
        ]
        
        for pattern in date_patterns:
            match = re.search(pattern, text)
            if match:
                return match.group(0)
        
        return None


if __name__ == "__main__":
    print("📸 Receipt Scanner Module")
    print("=" * 50)
    print("\nFeatures:")
    print("  ✅ Image preprocessing")
    print("  ✅ OCR text extraction")
    print("  ✅ Item detection")
    print("  ✅ Quantity extraction")
    print("  ✅ Receipt region detection")
    print("\nRequires:")
    print("  - OpenCV")
    print("  - Tesseract OCR")
    print("  - PIL")
