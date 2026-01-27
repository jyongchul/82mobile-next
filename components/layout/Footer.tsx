'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  const t = useTranslations();
  const locale = useLocale();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-seoul-night text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Image
              src="/images/logo/logo.png"
              alt="82Mobile"
              width={120}
              height={40}
              className="h-10 w-auto brightness-0 invert"
            />
            <p className="text-sm text-gray-400">
              {t('footer.tagline')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading font-bold text-white mb-4">
              {t('footer.quickLinks')}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href={`/${locale}/shop`}
                  className="hover:text-white transition-colors"
                >
                  {t('nav.shop')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/about`}
                  className="hover:text-white transition-colors"
                >
                  {t('nav.about')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/faq`}
                  className="hover:text-white transition-colors"
                >
                  {t('nav.faq')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/contact`}
                  className="hover:text-white transition-colors"
                >
                  {t('nav.contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-heading font-bold text-white mb-4">
              {t('footer.legal')}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href={`/${locale}/privacy-policy`}
                  className="hover:text-white transition-colors"
                >
                  {t('footer.privacyPolicy')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/terms-of-service`}
                  className="hover:text-white transition-colors"
                >
                  {t('footer.termsOfService')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/refund-policy`}
                  className="hover:text-white transition-colors"
                >
                  {t('footer.refundPolicy')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading font-bold text-white mb-4">
              {t('footer.contact')}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="mailto:adamwoohaha@naver.com"
                  className="hover:text-white transition-colors"
                >
                  adamwoohaha@naver.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+821064246530"
                  className="hover:text-white transition-colors"
                >
                  +82 10-6424-6530
                </a>
              </li>
              <li>
                <a
                  href="http://pf.kakao.com/_GXxjPxj"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3zm5.907 8.06l1.47-1.424a.472.472 0 0 0-.656-.681l-1.928 1.866V9.282a.472.472 0 0 0-.944 0v2.557a.471.471 0 0 0 0 .222V13.5a.472.472 0 0 0 .944 0v-1.363l.427-.413 1.428 2.033a.472.472 0 1 0 .773-.543l-1.514-2.155zm-2.958 1.924h-1.46V9.297a.472.472 0 0 0-.943 0v4.159c0 .26.21.472.471.472h1.932a.472.472 0 1 0 0-.944zm-5.857 0h-1.46V9.297a.472.472 0 0 0-.943 0v4.159c0 .26.21.472.471.472h1.932a.472.472 0 1 0 0-.944zm4.563-1.078l-1.688-2.51c-.179-.27-.525-.345-.771-.165a.62.62 0 0 0-.153.165l-1.689 2.51a.471.471 0 0 0 .791.523l.287-.426h2.145l.287.426a.473.473 0 0 0 .791-.523zm-2.058-.943l.584-.868.584.868h-1.168z"/>
                  </svg>
                  KakaoTalk
                </a>
              </li>
            </ul>
          </div>

          {/* Stores */}
          <div>
            <h3 className="font-heading font-bold text-white mb-4">
              {t('footer.stores')}
            </h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>📍 {t('footer.myeongdong')}</li>
              <li>📍 {t('footer.hongdae')}</li>
            </ul>
          </div>
        </div>

        {/* Business Information (EXIMBAY Requirement) */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="text-xs text-gray-400 space-y-1">
            <p><strong className="text-gray-300">상호명 (Business Name):</strong> [고객 정보 대기 중]</p>
            <p><strong className="text-gray-300">대표자 (CEO):</strong> [고객 정보 대기 중]</p>
            <p><strong className="text-gray-300">사업자등록번호 (Business Registration No.):</strong> [고객 정보 대기 중]</p>
            <p><strong className="text-gray-300">주소 (Address):</strong> [고객 정보 대기 중]</p>
            <p><strong className="text-gray-300">고객지원 (Customer Support):</strong> adamwoohaha@naver.com | +82 10-6424-6530</p>
          </div>
        </div>

        {/* Bottom Bar - MUST include Whitehat Marketing credit */}
        <div className="mt-8 pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>
            © {currentYear} 82Mobile. All rights reserved.
          </p>

          {/* CRITICAL: Whitehat Marketing footer credit (STANDING ORDER) */}
          <p className="text-xs mt-4 md:mt-0">
            Powered by{' '}
            <a
              href="http://whmarketing.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Whitehat Marketing
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
