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
allowed_origins = ["http://localhost:3000", "http://localhost:3001"]
frontend_url = os.getenv('FRONTEND_URL')
if frontend_url:
    allowed_origins.append(frontend_url)

CORS(app, resources={r"/api/*": {
    "origins": allowed_origins,
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

# Veritabanı tabloları oluştur ve varsayılan kategorileri yükle
with app.app_context():
    db.create_all()
    from models import Category
    if not Category.query.first():
        default_categories = [
            (1, "Maaş", "Aylik maas gelirleri", True),
            (2, "Yemek", "Yemek ve gida harcamalari", False),
            (3, "Ulaşım", "Toplu tasima ve yakit harcamalari", False),
            (4, "Kira", "Ev kirasi odemesi", False),
            (5, "Fatura", "Elektrik, su, internet vb. faturalar", False),
            (6, "Eğlence", "Sinema, tiyatro, konser vb. eglence harcamalari", False),
            (7, "Sağlık", "Eczane ve hastane harcamalari", False),
            (8, "Diğer", "Diger harcamalar", False)
        ]
        for cid, cname, desc, is_default in default_categories:
            db.session.add(Category(
                category_id=cid,
                category_name=cname,
                description=desc,
                is_system_default=is_default
            ))
        db.session.commit()

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
