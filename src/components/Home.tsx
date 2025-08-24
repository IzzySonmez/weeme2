import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Sparkles, FileText, Users, ArrowRight, Check } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">weeme.ai</span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
                Özellikler
              </a>
              <a href="#plans" className="text-gray-600 hover:text-gray-900 transition-colors">
                Planlar
              </a>
              <Link
                to="/app"
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
              >
                Giriş Yap
              </Link>
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Link
                to="/app"
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
              >
                Giriş
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Yapay Zeka ile
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
              {' '}SEO Optimizasyonu
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Web sitenizin SEO performansını artırmak hiç bu kadar kolay olmamıştı. 
            Yapay zeka destekli analizler ve otomatik raporlarla SEO'yu herkes için basitleştiriyoruz.
          </p>
          <Link
            to="/app"
            className="inline-flex items-center bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-md text-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105"
          >
            Hemen Başla
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Güçlü Özellikler
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              weeme.ai ile SEO sürecinizi otomatikleştirin ve daha iyi sonuçlar alın
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-lg shadow-sm p-8 text-center hover:shadow-md transition-shadow">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Otomatik SEO Taramaları
              </h3>
              <p className="text-gray-600">
                Web sitenizi düzenli olarak tarayarak SEO performansınızı analiz eder 
                ve detaylı raporlar sunar.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-lg shadow-sm p-8 text-center hover:shadow-md transition-shadow">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Yapay Zeka İçerik Üretimi
              </h3>
              <p className="text-gray-600">
                LinkedIn, Instagram, Twitter ve Facebook için SEO odaklı 
                içerikler oluşturun ve sosyal medya stratinizi güçlendirin.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-lg shadow-sm p-8 text-center hover:shadow-md transition-shadow">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <FileText className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Akıllı Raporlar
              </h3>
              <p className="text-gray-600">
                Anlaşılır grafikler ve eylem planları ile SEO performansınızı 
                takip edin ve iyileştirme önerilerini uygulayın.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section id="plans" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Size Uygun Planı Seçin
            </h2>
            <p className="text-lg text-gray-600">
              İhtiyacınıza göre tasarlanmış esnek fiyatlandırma seçenekleri
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Free</h3>
              <div className="text-3xl font-bold text-gray-900 mb-6">
                ₺0<span className="text-lg font-normal text-gray-600">/ay</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center justify-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-gray-600">3 kredi</span>
                </li>
                <li className="flex items-center justify-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-gray-600">Temel raporlar</span>
                </li>
              </ul>
            </div>

            {/* Pro Plan */}
            <div className="bg-white border-2 border-purple-600 rounded-lg p-8 text-center relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Popüler
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Pro</h3>
              <div className="text-3xl font-bold text-gray-900 mb-6">
                ₺99<span className="text-lg font-normal text-gray-600">/ay</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center justify-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-gray-600">Sınırsız tarama</span>
                </li>
                <li className="flex items-center justify-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-gray-600">AI SEO önerileri</span>
                </li>
                <li className="flex items-center justify-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-gray-600">Detaylı raporlar</span>
                </li>
              </ul>
            </div>

            {/* Advanced Plan */}
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Advanced</h3>
              <div className="text-3xl font-bold text-gray-900 mb-6">
                ₺199<span className="text-lg font-normal text-gray-600">/ay</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center justify-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-gray-600">Tüm Pro özellikleri</span>
                </li>
                <li className="flex items-center justify-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-gray-600">AI içerik üretimi</span>
                </li>
                <li className="flex items-center justify-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-gray-600">7/24 destek</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              to="/app"
              className="inline-flex items-center bg-purple-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-purple-700 transition-colors"
            >
              Detaylı Planlar
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials/CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center mb-6">
            <Users className="h-12 w-12 text-white mr-4" />
            <div className="text-left">
              <div className="text-4xl font-bold text-white">100+</div>
              <div className="text-purple-100">Mutlu Müşteri</div>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            100+ site weeme.ai ile SEO performansını yükseltti
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Siz de aramıza katılın ve web sitenizin potansiyelini keşfedin
          </p>
          <Link
            to="/app"
            className="inline-flex items-center bg-white text-purple-600 px-8 py-4 rounded-md text-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Ücretsiz Başla
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <BarChart3 className="h-8 w-8 text-purple-400" />
              <span className="ml-2 text-2xl font-bold text-white">weeme.ai</span>
            </div>
            <div className="text-gray-400 text-center md:text-right">
              <p>&copy; 2025 weeme.ai – All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;