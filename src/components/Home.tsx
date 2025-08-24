import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Rocket, BarChart3, CheckCircle2, CalendarClock, Shield } from 'lucide-react';

const Home: React.FC = () => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-600" />
            <span className="font-semibold text-lg">weeme.ai</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <button onClick={() => scrollTo('features')} className="hover:text-gray-700">Özellikler</button>
            <button onClick={() => scrollTo('plans')} className="hover:text-gray-700">Planlar</button>
            <button onClick={() => scrollTo('faq')} className="hover:text-gray-700">SSS</button>
            {/* Giriş Yap → /login */}
            <Link to="/login" className="px-3 py-1.5 rounded-md border hover:bg-gray-50">Giriş Yap</Link>
            {/* Hemen Başla → /register */}
            <Link to="/register" className="px-4 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700">Hemen Başla</Link>
          </nav>
          <div className="md:hidden">
            {/* Mobilde kısa buton: Hemen Başla → /register */}
            <Link to="/register" className="px-3 py-1.5 rounded-md bg-purple-600 text-white">Başla</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-50 via-white to-white" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
                SEO’nuzu <span className="text-purple-600">yapay zekâ</span> ile otomatikleştirin
              </h1>
              <p className="mt-4 text-lg text-gray-600">
                weeme.ai, sitenize ekleyeceğiniz tek bir kodla A’dan Z’ye SEO taraması yapar, puanlar,
                eksikleri ve yapılacakları çıkarır; düzenli aralıklarla otomatik raporlar üretir.
              </p>
              <div className="mt-6 flex items-center gap-3">
                {/* Hemen Başla → /register */}
                <Link to="/register" className="px-5 py-3 rounded-md bg-purple-600 text-white hover:bg-purple-700 inline-flex items-center gap-2">
                  <Rocket className="h-5 w-5" /> Hemen Başla
                </Link>
                <button onClick={() => scrollTo('features')} className="px-5 py-3 rounded-md border hover:bg-gray-50">
                  Özellikleri Gör
                </button>
              </div>
              <div className="mt-6 flex items-center gap-4 text-sm text-gray-600">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> 3 dakikada kurulum
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Otomatik raporlar
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Ücretsiz başlangıç
              </div>
            </div>
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-purple-50 border text-center">
                  <div className="text-2xl font-bold text-purple-700">82</div>
                  <div className="text-xs text-gray-600">Ortalama SEO Skoru</div>
                </div>
                <div className="p-4 rounded-lg bg-blue-50 border text-center">
                  <div className="text-2xl font-bold text-blue-700">120+</div>
                  <div className="text-xs text-gray-600">Tarama / gün</div>
                </div>
                <div className="p-4 rounded-lg bg-emerald-50 border text-center">
                  <div className="text-2xl font-bold text-emerald-700">15%</div>
                  <div className="text-xs text-gray-600">Ortalama artış</div>
                </div>
              </div>
              <div className="mt-6 p-4 rounded-lg bg-gray-50 border">
                <div className="flex items-center gap-2 text-gray-900 font-medium">
                  <BarChart3 className="h-5 w-5 text-indigo-600" /> Örnek Rapor Özeti
                </div>
                <ul className="mt-2 text-sm text-gray-700 list-disc ml-5 space-y-1">
                  <li>Meta başlık/açıklama mevcut ✓</li>
                  <li>H1 eksik — <span className="text-indigo-700">Öneri:</span> ana sayfaya H1 ekleyin</li>
                  <li>XML sitemap bulunamadı — <span className="text-indigo-700">Öneri:</span> oluşturup Search Console’a ekleyin</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 border-t bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center">Öne Çıkan Özellikler</h2>
          <p className="text-center text-gray-600 mt-2">Kodunuzu ekleyin, gerisini weeme.ai halletsin.</p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="p-6 rounded-xl border">
              <BarChart3 className="h-6 w-6 text-indigo-600" />
              <h3 className="mt-3 font-semibold">A’dan Z’ye SEO Taraması</h3>
              <p className="text-sm text-gray-600 mt-1">Meta, başlıklar, performans, mobil uyumluluk, SSL ve daha fazlasını tarar.</p>
            </div>
            <div className="p-6 rounded-xl border">
              <CalendarClock className="h-6 w-6 text-emerald-600" />
              <h3 className="mt-3 font-semibold">Otomatik Raporlama</h3>
              <p className="text-sm text-gray-600 mt-1">Haftalık, 2 haftalık veya aylık otomatik rapor akışı ve geçmiş.</p>
            </div>
            <div className="p-6 rounded-xl border">
              <Shield className="h-6 w-6 text-purple-600" />
              <h3 className="mt-3 font-semibold">Kredi & Üyelik Kontrolü</h3>
              <p className="text-sm text-gray-600 mt-1">Free/Pro/Advanced planları, kredi bazlı tarama, panel içi ödeme akışı.</p>
            </div>
            <div className="p-6 rounded-xl border">
              <Sparkles className="h-6 w-6 text-fuchsia-600" />
              <h3 className="mt-3 font-semibold">AI İçerik Üretimi</h3>
              <p className="text-sm text-gray-600 mt-1">Advanced planda LinkedIn/Instagram/Twitter/Facebook içerik üret.</p>
            </div>
            <div className="p-6 rounded-xl border">
              <Rocket className="h-6 w-6 text-sky-600" />
              <h3 className="mt-3 font-semibold">Hızlı Kurulum</h3>
              <p className="text-sm text-gray-600 mt-1">&lt;head&gt; içine tek satır kod ekle, taramalar başlasın.</p>
            </div>
            <div className="p-6 rounded-xl border">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              <h3 className="mt-3 font-semibold">Eyleme Dönük Öneriler</h3>
              <p className="text-sm text-gray-600 mt-1">Eksikleri tek tek listeler, nasıl düzelteceğini açıklar.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Plans */}
      <section id="plans" className="py-16 bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center">Planlar</h2>
          <p className="text-center text-gray-600 mt-2">İhtiyacınıza uygun üyelikle başlayın.</p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="p-6 rounded-xl border bg-white">
              <div className="text-sm font-semibold text-gray-700">Free</div>
              <div className="mt-2 text-3xl font-bold">₺0</div>
              <ul className="mt-3 text-sm text-gray-700 space-y-1">
                <li>• 3 kredi (3 tarama)</li>
                <li>• Temel rapor</li>
                <li>• Panel erişimi</li>
              </ul>
              <Link to="/register" className="mt-4 inline-block w-full text-center px-4 py-2 rounded-md border hover:bg-gray-50">
                Ücretsiz Başla
              </Link>
            </div>

            <div className="p-6 rounded-xl border bg-white">
              <div className="text-sm font-semibold text-blue-700">Pro</div>
              <div className="mt-2 text-3xl font-bold">₺99<span className="text-base text-gray-500">/ay</span></div>
              <ul className="mt-3 text-sm text-gray-700 space-y-1">
                <li>• Sınırsız (adil kullanım)</li>
                <li>• AI SEO önerileri</li>
                <li>• Detaylı raporlar</li>
              </ul>
              <Link to="/register" className="mt-4 inline-block w-full text-center px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">
                Pro’ya Geç
              </Link>
            </div>

            <div className="p-6 rounded-xl border bg-white ring-2 ring-purple-200">
              <div className="text-sm font-semibold text-purple-700">Advanced</div>
              <div className="mt-2 text-3xl font-bold">₺199<span className="text-base text-gray-500">/ay</span></div>
              <ul className="mt-3 text-sm text-gray-700 space-y-1">
                <li>• Tüm Pro özellikleri</li>
                <li>• AI içerik üretimi</li>
                <li>• 7/24 destek</li>
              </ul>
              <Link to="/register" className="mt-4 inline-block w-full text-center px-4 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700">
                Advanced’e Geç
              </Link>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link to="/register" className="inline-flex items-center gap-2 px-5 py-2 rounded-md border hover:bg-gray-50">
              Detaylı Planlar ve Kayıt
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials / CTA */}
      <section className="py-16 bg-white border-t">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-semibold">100+ site weeme.ai ile SEO performansını yükseltti</h3>
          <p className="mt-2 text-gray-600">Siz de dakikalar içinde kurulum yapın, düzenli raporlar almaya başlayın.</p>
          <Link to="/register" className="mt-6 inline-block px-6 py-3 rounded-md bg-purple-600 text-white hover:bg-purple-700">
            Ücretsiz Başlayın
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 bg-gray-50 border-t">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center">Sık Sorulan Sorular</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <div>
              <div className="font-semibold">Kurulum nasıl yapılıyor?</div>
              <p className="text-sm text-gray-600 mt-1">Panelde üretilen kodu sitenizin &lt;head&gt; bölümüne ekliyorsunuz. Hepsi bu.</p>
            </div>
            <div>
              <div className="font-semibold">Ücretsiz plan neleri içeriyor?</div>
              <p className="text-sm text-gray-600 mt-1">3 tarama kredisi, temel rapor ve panel erişimi içerir.</p>
            </div>
            <div>
              <div className="font-semibold">Otomatik raporlar nasıl çalışır?</div>
              <p className="text-sm text-gray-600 mt-1">Haftalık, 2 haftalık veya aylık seçime göre planlanır ve rapor geçmişinde saklanır.</p>
            </div>
            <div>
              <div className="font-semibold">AI içerik üretimi hangi planda?</div>
              <p className="text-sm text-gray-600 mt-1">Advanced planında LinkedIn/Instagram/Twitter/Facebook içerikleri üretebilirsiniz.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between text-sm text-gray-600">
          <span>© 2025 weeme.ai</span>
          <Link to="/login" className="hover:underline">Giriş yap</Link>
        </div>
      </footer>
    </div>
  );
};

export default Home;
