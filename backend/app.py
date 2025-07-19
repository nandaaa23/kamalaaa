
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
import json
from typing import List, Dict, Optional
from datetime import datetime
import re
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for React Native

class PostpartumSupportChatbot:
    def __init__(self, api_key: str):
        """Initialize the postpartum depression support chatbot"""
        self.api_key = api_key
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        
        self.supported_languages = {
            'hindi': 'हिंदी',
            'tamil': 'தமிழ்',
            'bengali': 'বাংলা',
            'telugu': 'తెలుగు',
            'marathi': 'मराठी',
            'gujarati': 'ગુજરાતી',
            'kannada': 'ಕನ್ನಡ',
            'malayalam': 'മലയാളം',
            'punjabi': 'ਪੰਜਾਬੀ',
            'urdu': 'اردو',
            'english': 'English'
        }
        
        # Store conversations per session
        self.conversations = {}
        
        self.emergency_keywords = {
            'english': ['suicide', 'kill myself', 'end it all', 'hurt myself', 'can\'t go on'],
            'hindi': ['आत्महत्या', 'मरना चाहती हूं', 'जीना नहीं चाहती', 'खुद को नुकसान'],
            'tamil': ['தற்கொலை', 'சாக வேண்டும்', 'வாழ விருப்பமில்லை'],
            'bengali': ['আত্মহত্যা', 'মরতে চাই', 'বাঁচতে ইচ্ছে করছে না'],
            'telugu': ['ఆత్మహత్య', 'చనిపోవాలని అనిపిస్తుంది'],
            'marathi': ['आत्महत्या', 'मरायचे वाटते'],
            'gujarati': ['આત્મહત્યા', 'મરવું છે'],
            'kannada': ['ಆತ್ಮಹತ್ಯೆ', 'ಸಾಯಬೇಕು ಅನಿಸುತ್ತೆ'],
            'malayalam': ['ആത്മഹത്യ', 'മരിക്കാൻ തോന്നുന്നു'],
            'punjabi': ['ਖੁਦਕੁਸ਼ੀ', 'ਮਰਨਾ ਚਾਹੁੰਦੀ ਹਾਂ'],
            'urdu': ['خودکشی', 'مرنا چاہتی ہوں']
        }

    def detect_language(self, text: str) -> str:
        """Detect language using Unicode ranges"""
        if re.search(r'[\u0900-\u097F]', text):
            return 'hindi'
        elif re.search(r'[\u0B80-\u0BFF]', text):
            return 'tamil'
        elif re.search(r'[\u0980-\u09FF]', text):
            return 'bengali'
        elif re.search(r'[\u0C00-\u0C7F]', text):
            return 'telugu'
        elif re.search(r'[\u0A80-\u0AFF]', text):
            return 'gujarati'
        elif re.search(r'[\u0C80-\u0CFF]', text):
            return 'kannada'
        elif re.search(r'[\u0D00-\u0D7F]', text):
            return 'malayalam'
        elif re.search(r'[\u0A00-\u0A7F]', text):
            return 'punjabi'
        elif re.search(r'[\u0600-\u06FF\u0750-\u077F]', text):
            return 'urdu'
        else:
            return 'english'

    def check_for_emergency(self, text: str, detected_lang: str) -> bool:
        """Check for crisis keywords"""
        text_lower = text.lower()
        emergency_words = self.emergency_keywords.get(detected_lang, [])
        
        for keyword in emergency_words:
            if keyword.lower() in text_lower:
                return True
        
        for keyword in self.emergency_keywords['english']:
            if keyword in text_lower:
                return True
                
        return False

    def get_emergency_response(self, detected_lang: str) -> str:
        """Get crisis response"""
        emergency_responses = {
            'english': """I'm very concerned about what you're going through right now. Your feelings are valid, but please know that you don't have to face this alone.

🆘 IMMEDIATE HELP:
• National Suicide Prevention Helpline: 9152987821
• AASRA: 91-22-27546669
• iCall: 9152987821

Please reach out to a trusted family member, friend, or healthcare provider right now. You and your baby need you here. This difficult time will pass, and there is help available.""",
            
            'hindi': """मुझे आपकी स्थिति की बहुत चिंता है। आपकी भावनाएं सही हैं, लेकिन कृपया जानें कि आपको अकेले इससे निपटना नहीं है।

🆘 तत्काल सहायता:
• राष्ट्रीय आत्महत्या रोकथाम हेल्पलाइन: 9152987821
• आसरा: 91-22-27546669

कृपया अभी किसी विश्वसनीय परिवारजन, मित्र या डॉक्टर से संपर्क करें। आप और आपका बच्चा दोनों आपकी जरूरत है।""",
            
            'tamil': """நீங்கள் அனுபவிக்கும் வலியைப் பற்றி எனக்கு மிகவும் கவலையாக உள்ளது। உங்கள் உணர்வுகள் சரியானவை, ஆனால் நீங்கள் தனியாக இதை எதிர்கொள்ள வேண்டியதில்லை.

🆘 உடனடி உதவி:
• தேசிய தற்கொலை தடுப்பு உதவி எண்: 9152987821
• ஆஸ்ரா: 91-22-27546669

உடனே நம்பகமான குடும்ப உறுப்பினர், நண்பர் அல்லது மருத்துவரை தொடர்பு கொள்ளுங்கள்.""",
        }
        
        return emergency_responses.get(detected_lang, emergency_responses['english'])

    def create_system_prompt(self, detected_lang: str, user_message: str, is_emergency: bool) -> str:
        """Create system prompt"""
        if is_emergency:
            return f"EMERGENCY SITUATION DETECTED. Respond in {detected_lang} language. Provide immediate crisis support and resources. User message in {detected_lang}: {user_message}"
        
        language_name = self.supported_languages.get(detected_lang, 'English')
        
        return f"""You are Kamala, a compassionate AI companion for postpartum depression support. 

IMPORTANT: The user wrote in {language_name} ({detected_lang}). You MUST respond in the SAME language ({language_name}).

Your personality:
- Warm, empathetic, non-judgmental
- Like a caring sister or friend
- Validate feelings without minimizing struggles
- Culturally sensitive to Indian motherhood

Key principles:
1. Always validate feelings - "What you're feeling is normal"
2. Remind that postpartum depression is medical, not personal failure
3. Encourage professional help when appropriate
4. Provide practical coping strategies
5. Consider Indian family dynamics and cultural expectations

User message in {language_name}: {user_message}

Respond with warmth and helpful guidance IN {language_name} LANGUAGE."""

    def get_response(self, user_input: str, session_id: str, user_name: Optional[str] = None) -> Dict:
        """Get chatbot response"""
        try:
            detected_lang = self.detect_language(user_input)
            is_emergency = self.check_for_emergency(user_input, detected_lang)
            
            if is_emergency:
                emergency_response = self.get_emergency_response(detected_lang)
                
                # Store in session history
                if session_id not in self.conversations:
                    self.conversations[session_id] = []
                
                conversation_entry = {
                    'timestamp': datetime.now().isoformat(),
                    'user_input': user_input,
                    'detected_language': detected_lang,
                    'bot_response': emergency_response,
                    'is_emergency': True,
                    'user_name': user_name
                }
                
                self.conversations[session_id].append(conversation_entry)
                
                return {
                    'success': True,
                    'response': emergency_response,
                    'detected_language': detected_lang,
                    'is_emergency': True,
                    'session_id': session_id
                }
            
            # Create supportive system prompt
            system_prompt = self.create_system_prompt(detected_lang, user_input, is_emergency)
            
            if user_name:
                personalized_prompt = f"{system_prompt}\n\nUser's name: {user_name}"
            else:
                personalized_prompt = system_prompt
            
            # Generate response
            response = self.model.generate_content(personalized_prompt)
            
            # Store in session history
            if session_id not in self.conversations:
                self.conversations[session_id] = []
            
            conversation_entry = {
                'timestamp': datetime.now().isoformat(),
                'user_input': user_input,
                'detected_language': detected_lang,
                'bot_response': response.text,
                'is_emergency': False,
                'user_name': user_name
            }
            
            self.conversations[session_id].append(conversation_entry)
            
            return {
                'success': True,
                'response': response.text,
                'detected_language': detected_lang,
                'is_emergency': False,
                'session_id': session_id
            }
            
        except Exception as e:
            logger.error(f"Error generating response: {str(e)}")
            error_message = "I'm here for you, even though I'm having a technical difficulty. Please reach out to a healthcare provider if you need immediate support."
            
            return {
                'success': False,
                'error': str(e),
                'response': error_message,
                'is_emergency': False
            }

# Initialize chatbot
API_KEY = os.getenv('GOOGLE_AI_API_KEY', 'YOUR_API_KEY_HERE')
chatbot = PostpartumSupportChatbot(API_KEY)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'Kamala Chatbot API'})

@app.route('/chat', methods=['POST'])
def chat():
    """Main chat endpoint"""
    try:
        data = request.json
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
            
        user_input = data.get('message', '').strip()
        session_id = data.get('session_id', 'default')
        user_name = data.get('user_name')
        
        if not user_input:
            return jsonify({
                'success': False,
                'error': 'Message is required'
            }), 400
        
        # Get response from chatbot
        result = chatbot.get_response(user_input, session_id, user_name)
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'message': 'Something went wrong. Please try again.'
        }), 500

@app.route('/conversation/<session_id>', methods=['GET'])
def get_conversation_history(session_id):
    """Get conversation history for a session"""
    try:
        history = chatbot.conversations.get(session_id, [])
        return jsonify({
            'success': True,
            'conversation': history,
            'session_id': session_id
        })
    except Exception as e:
        logger.error(f"Error getting conversation history: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to retrieve conversation history'
        }), 500

@app.route('/languages', methods=['GET'])
def get_supported_languages():
    """Get list of supported languages"""
    return jsonify({
        'success': True,
        'languages': chatbot.supported_languages
    })

@app.route('/resources', methods=['GET'])
def get_resources():
    """Get mental health resources"""
    resources = {
        'helplines': [
            {'name': 'AASRA Suicide Prevention', 'number': '91-22-27546669'},
            {'name': 'iCall Psychosocial Helpline', 'number': '9152987821'},
            {'name': 'Vandrevala Foundation', 'number': '9999666555'}
        ],
        'emergency_signs': [
            'Thoughts of harming yourself or baby',
            'Severe anxiety or panic attacks',
            'Inability to care for yourself or baby',
            'Hearing voices or seeing things'
        ],
        'self_care_tips': [
            'Rest whenever baby sleeps',
            'Accept help from family/friends',
            'Gentle walks in fresh air',
            'Connect with other new mothers',
            'Practice deep breathing'
        ]
    }
    
    return jsonify({
        'success': True,
        'resources': resources
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)