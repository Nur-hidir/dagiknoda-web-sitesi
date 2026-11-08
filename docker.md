Bir yazılımı kendi bilgisayarında çalıştırmak kolaydır. Zor olan, aynı yazılımın başka bir bilgisayarda da aynı şekilde çalışmasıdır. Bir projede Python’un bir sürümünü, belirli bir kütüphanenin tam bir sürümünü ve birkaç sistem ayarını doğru bir araya getirirsin; her şey çalışır. Sonra projeyi bir arkadaşına gönderirsin ve ekranda hata mesajları belirir.

“Bende çalışıyordu” cümlesi, yazılım dünyasının en bilinen özetidir. Docker tam olarak bu cümleyi ortadan kaldırmak için ortaya çıktı. Fikir şu: uygulamayı, çalışması için gereken her şeyle birlikte tek bir pakete koy ve o paketi nereye götürürsen götür aynı şekilde çalışsın.

---

Bu fikri anlamama en çok yardım eden şey deniz taşımacılığı oldu. Konteynerler yaygınlaşmadan önce gemilere yük tek tek yüklenirdi: çuvallar, fıçılar, sandıklar, hepsi farklı boyutta ve farklı özenle taşınması gereken şeyler. Bir limanda bir gemiyi yüklemek günler sürebilirdi.

Sonra standart boyutlu çelik konteyner geldi. İçine ne koyduğun önemli değildi; kutunun ölçüleri herkes için aynıydı. Vinç, kamyon, tren ve gemi, içinde ne olduğunu bilmeden aynı kutuyu taşıyabiliyordu. Liman işçisinin kutunun içini bilmesine gerek kalmadı, kutuyu kaldırmayı bilmesi yeterliydi.

Docker konteyneri de aynı işi yazılım için yapar. Uygulamanı, kullandığı kütüphaneleri, ayar dosyalarını ve çalışması için gereken ortamı tek bir kutuya koyarsın. Bu kutuyu kendi bilgisayarında, arkadaşının bilgisayarında ya da bir sunucuda açtığında aynı şekilde davranır. Yazılımı çalıştıran kişinin içeride ne olduğunu bilmesine gerek yoktur; kutuyu açmayı bilmesi yeterlidir.

---

Docker’da iki kavramı ayırmak gerekiyor: imaj ve konteyner. İmaj, kutunun tarifi ve malzeme listesi gibidir; içinde uygulamanın kodu, kütüphaneler ve çalışması için gereken her şey vardır, ama kendi başına çalışmaz. Konteyner ise bu imajdan başlatılmış, çalışan hâlidir. Aynı imajdan istediğin kadar konteyner başlatabilirsin; her biri birbirinden ayrı çalışır.

İmajı tarif eden dosyaya Dockerfile denir. İçinde hangi temel sistemden başlayacağın, hangi kütüphaneleri kuracağın, kodunu nereye kopyalayacağın ve uygulamanın hangi komutla çalışacağı satır satır yazılır. Docker bu dosyayı okuyup imajı adım adım oluşturur ve her adım bir katman olarak saklanır. Bir satırı değiştirdiğinde sadece o noktadan sonrası yeniden oluşturulur, bu da derlemeyi hızlandırır.

Hazır imajları indirmek için de bir yer var: Docker Hub. Python, PostgreSQL ya da Ubuntu gibi yaygın şeylerin hazır imajları orada durur. Sıfırdan başlamak yerine bunlardan birini temel alıp üzerine kendi uygulamanı eklersin.

---

Akla gelen ilk soru şu oluyor: bu, sanal makineden farklı mı? Farklı. Sanal makine, kendi işletim sistemini ve onun çekirdeğini de içinde taşır; bu yüzden büyüktür, açılması genellikle dakikalar sürer ve çok bellek ister. Konteyner ise ana bilgisayarın çekirdeğini paylaşır. Linux’un namespace ve cgroups gibi özellikleri sayesinde her konteyner kendi dosyalarını, kendi süreçlerini ve kendi ağ ayarlarını görür, ama aslında hepsi aynı çekirdeğin üzerinde çalışır.

Bu yüzden konteynerler çok hafiftir. Bir konteyner saniyeler içinde açılır ve bir bilgisayarda onlarcası aynı anda çalışabilir. Bunun bir bedeli de var: sanal makineye göre yalıtım daha zayıftır, çünkü çekirdek ortaktır. Güvenlik açısından çok hassas işlerde bunu bilmek gerekiyor.

Windows’ta bu işin bir püf noktası var: konteynerler Linux çekirdeğine ihtiyaç duyduğu için Docker, Windows’ta arka planda küçük bir Linux ortamı kullanır. Güncel sürümlerde bu ortam WSL 2 üzerinden çalışır. Bir önceki yazıda anlattığım WSL’in işe yaradığı yer tam olarak burası.

---

Denemek için kurulum bittikten sonra terminale `docker run hello-world` yazman yeterli. Docker imajı indirir, bir konteyner başlatır ve ekrana küçük bir karşılama mesajı basar. Çalışan konteynerleri görmek için `docker ps`, kendi Dockerfile’ından imaj oluşturmak için `docker build` komutu var.

Bilmem gereken bir ayrıntı: bir konteyner silindiğinde içindeki veriler de gider. Kalıcı veri için “volume” denen ayrı bir depolama alanı kullanılıyor. Birden fazla konteyneri birlikte yönetmek için Docker Compose adında bir araç var, o ayrı bir konu.

Yapay zekâ projelerinde de bu, ortamı herkeste aynı tutmak için çok işe yarıyor. Her şeyi bildiğimi iddia etmiyorum; bu defterde anladığım kadarını yazıyorum.
