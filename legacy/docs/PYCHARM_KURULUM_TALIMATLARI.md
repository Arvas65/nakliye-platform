# PyCharm Kurulum ve Çalıştırma Talimatları

Bu doküman, Nakliye Platformu projesini Windows işletim sisteminde PyCharm IDE kullanarak nasıl kuracağınızı ve çalıştıracağınızı adım adım açıklamaktadır.

## 1. PyCharm Kurulumu

1.  **PyCharm İndirme**: JetBrains resmi web sitesinden PyCharm Community Edition'ı indirin ve kurun:
    [https://www.jetbrains.com/pycharm/download/](https://www.jetbrains.com/pycharm/download/)
2.  **Kurulum Sihirbazı**: Kurulum sihirbazındaki adımları takip edin. Varsayılan ayarları genellikle yeterlidir.

## 2. Backend (Flask) Projesini PyCharm'da Çalıştırma

### 2.1. Projeyi Açma

1.  PyCharm'ı açın.
2.  Ana ekranda veya `File > Open` menüsünden `nakliye-platform` klasörünü seçin ve `Open`'a tıklayın.

### 2.2. Sanal Ortam (Virtual Environment) Kurulumu

1.  PyCharm, projeyi açtığınızda otomatik olarak bir sanal ortam oluşturmayı önerebilir. Eğer önermezse:
    -   `File > Settings` (veya `Ctrl+Alt+S`)
    -   `Project: nakliye-platform > Python Interpreter`'a gidin.
    -   Sağ üstteki dişli simgesine tıklayın ve `Add Interpreter > Add Local Interpreter` seçeneğini seçin.
    -   `Virtualenv Environment`'ı seçin. `New environment` seçili olduğundan emin olun.
    -   `Location` ve `Base interpreter` (Python 3.x) ayarlarını kontrol edin ve `OK`'a tıklayın.

### 2.3. Gerekli Paketleri Yükleme

1.  Sanal ortam oluşturulduktan sonra, PyCharm size `requirements.txt` dosyasındaki paketleri yüklemeyi önerecektir. `Install requirements`'a tıklayın.
2.  Eğer otomatik olarak önermezse, PyCharm terminalini açın (`Alt+F12` veya `View > Tool Windows > Terminal`) ve aşağıdaki komutu çalıştırın:
    ```bash
    pip install -r requirements.txt
    ```

### 2.4. Veritabanını Oluşturma

1.  PyCharm terminalinde `nakliye-platform` dizininde olduğunuzdan emin olun.
2.  Aşağıdaki komutu çalıştırarak veritabanını oluşturun:
    ```bash
    python create_db.py
    ```
    Bu komut, `src/database/app.db` dosyasını oluşturacaktır.

### 2.5. Flask Uygulamasını Çalıştırma

1.  PyCharm'da `src/main.py` dosyasını açın.
2.  Dosyanın sağ üst köşesindeki yeşil 


üçgen (Run) ikonuna tıklayın veya `Shift+F10` tuşuna basın.
3.  Flask uygulaması varsayılan olarak `http://127.0.0.1:5002` adresinde çalışmaya başlayacaktır.

## 3. Frontend (React) Projesini PyCharm Terminalinde Çalıştırma

### 3.1. Projeyi Açma

1.  PyCharm içinde yeni bir terminal açın (`Alt+F12` veya `View > Tool Windows > Terminal`).
2.  Terminalde `nakliye-frontend` dizinine gidin:
    ```bash
    cd ../nakliye-frontend
    ```

### 3.2. Gerekli Paketleri Yükleme

1.  Aşağıdaki komutu çalıştırarak Node.js paketlerini yükleyin:
    ```bash
    npm install
    ```
    Bu işlem biraz zaman alabilir.

### 3.3. React Uygulamasını Çalıştırma

1.  Paketler yüklendikten sonra, React geliştirme sunucusunu başlatmak için aşağıdaki komutu çalıştırın:
    ```bash
    npm run dev
    ```
2.  React uygulaması varsayılan olarak `http://localhost:5173` adresinde çalışmaya başlayacaktır. Tarayıcınızda bu adresi ziyaret ederek frontend arayüzünü görebilirsiniz.

## 4. Proje Yapısı

Proje iki ana klasörden oluşmaktadır:

-   `nakliye-platform`: Flask tabanlı backend API kodlarını içerir.
    -   `src/`: Ana uygulama kodları, modeller, rotalar ve servisler.
    -   `create_db.py`: Veritabanını oluşturan script.
    -   `requirements.txt`: Python bağımlılıkları.
-   `nakliye-frontend`: React tabanlı web arayüzü kodlarını içerir.
    -   `src/`: React bileşenleri, contextler ve ana uygulama dosyaları.
    -   `public/`: Statik dosyalar.
    -   `package.json`: Node.js bağımlılıkları.

## 5. Sorun Giderme

-   **Port Hatası**: Eğer Flask veya React uygulaması başlatılırken "Address already in use" gibi bir hata alırsanız, ilgili portu kullanan başka bir uygulamanın çalıştığını gösterir. Bu durumda bilgisayarınızı yeniden başlatabilir veya farklı bir port kullanmak için `src/main.py` (Flask için) veya `vite.config.js` (React için) dosyalarını düzenleyebilirsiniz.
-   **Modül Bulunamadı Hatası**: `ModuleNotFoundError` gibi bir hata alırsanız, `pip install -r requirements.txt` (Python için) veya `npm install` (Node.js için) komutlarını doğru sanal ortamda/dizinde çalıştırdığınızdan emin olun.
-   **Veritabanı Sorunları**: Eğer veritabanı ile ilgili sorunlar yaşarsanız, `create_db.py` scriptini tekrar çalıştırarak veritabanını sıfırlayabilirsiniz.

Bu talimatları takip ederek Nakliye Platformu projesini PyCharm IDE üzerinde başarıyla çalıştırabilirsiniz. İyi çalışmalar!

