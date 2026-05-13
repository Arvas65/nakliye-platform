#!/usr/bin/env python3
import os


from src.models.user import db
from src.models.cargo import CargoPost
from src.models.offer import Offer
from flask import Flask

# Flask uygulaması oluştur
app = Flask(__name__)
app.config['SECRET_KEY'] = 'nakliye-platform-secret-key-2024'
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'src', 'database', 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Veritabanını başlat
db.init_app(app)

with app.app_context():
    # Mevcut tabloları sil
    db.drop_all()
    print("Mevcut tablolar silindi.")
    
    # Yeni tabloları oluştur
    db.create_all()
    print("Yeni tablolar oluşturuldu.")
    
    print("Veritabanı başarıyla yeniden oluşturuldu!")

