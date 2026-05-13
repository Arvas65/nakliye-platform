import os


from flask import Flask, send_from_directory
from flask_cors import CORS
from src.models.user import db
from src.models.cargo import CargoPost
from src.models.offer import Offer
from src.models.message import Message, Conversation
from src.services.notification_service import Notification
from src.routes.user import user_bp
from src.routes.auth import auth_bp
from src.routes.cargo import cargo_bp
from src.routes.offer import offer_bp
from src.routes.chat import chat_bp
from src.routes.map import map_bp
from src.routes.notification import notification_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'nakliye-platform-secret-key-2024'

# CORS ayarları - frontend ile backend arasındaki iletişim için
CORS(app, origins="*")

# Blueprint'leri kaydet
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(cargo_bp, url_prefix='/api')
app.register_blueprint(offer_bp, url_prefix='/api')
app.register_blueprint(chat_bp, url_prefix='/api')
app.register_blueprint(map_bp, url_prefix='/api')
app.register_blueprint(notification_bp, url_prefix='/api')

# Veritabanı ayarları
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

with app.app_context():
    db.create_all()

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
            return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5002)
