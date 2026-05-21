"""
Finans Takip Sistemi - Ana Flask Uygulaması
Sorumlulukların ayrılması ilkesine göre organize edilmiştir.
"""
from flask import Flask, jsonify
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from dotenv import load_dotenv
import os

# Modülleri yükle
from models import db
from routes.auth_routes import auth_bp
from routes.transaction_routes import transaction_bp
from routes.budget_routes import budget_bp
from routes.family_routes import family_bp
from routes.admin_routes import admin_bp

load_dotenv()

app = Flask(__name__)

# CORS ayarları - Frontend'in backend ile iletişim kurabilmesi için
CORS(app, resources={r"/api/*": {
    "origins": ["http://localhost:3000", "http://localhost:3001"],
    "allow_headers": ["Content-Type", "Authorization"],
    "expose_headers": ["Content-Type", "Authorization"]
}})

# Konfigürasyon
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///finance.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Veritabanı ve JWT başlat
db.init_app(app)
jwt = JWTManager(app)

# Blueprint'leri Kayıt Et
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(transaction_bp, url_prefix='/api/transactions')
app.register_blueprint(budget_bp, url_prefix='/api/budget')
app.register_blueprint(family_bp, url_prefix='/api/family')
app.register_blueprint(admin_bp, url_prefix='/api/admin')

# Veritabanı tabloları oluştur
with app.app_context():
    db.create_all()

# Temel Rota
@app.route('/api/health', methods=['GET'])
def health_check():
    """Sistem sağlık kontrolü"""
    return jsonify({'status': 'OK', 'message': 'API çalışıyor'}), 200

# Hata İşleyiciler
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint bulunamadı'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Sunucu hatası'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
