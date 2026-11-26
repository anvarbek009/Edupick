import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Phone, ShieldCheck, Send, UserCheck, LogIn, UserPlus } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { getDictionary } from '../i18n';
import { BRAND_CONFIG, CITIES } from '../config/brand';
import { UserRole } from '../types/domain';
import { formatUzPhone, isValidUzPhone } from '../utils/format';

export const AuthModal: React.FC = () => {
  const {
    authModalOpen,
    closeAuthModal,
    language,
    signInWithOtp,
    findRegisteredUser,
    quickDemoLogin,
    pushToast,
  } = useAppStore();
  const t = getDictionary(language);

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('+998 ');
  const [name, setName] = useState('');
  const [cityId, setCityId] = useState('tashkent');
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authModalOpen) return;
    setMode('login');
    setStep('phone');
    setOtp('');
    setError('');
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAuthModal();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [authModalOpen, closeAuthModal]);

  const matchedExisting = isValidUzPhone(phone) ? findRegisteredUser(phone) : undefined;

  const copy = {
    loginTab: language === 'ru' ? 'Вход' : language === 'en' ? 'Sign In' : 'Kirish',
    registerTab: language === 'ru' ? 'Регистрация' : language === 'en' ? 'Register' : "Ro'yxatdan o'tish",
    regionLabel: language === 'ru' ? 'Регион / область' : language === 'en' ? 'Region / City' : 'Viloyat / Shahar',
    invalidPhone:
      language === 'ru'
        ? 'Введите полный номер телефона: +998 XX XXX XX XX'
        : language === 'en'
          ? 'Enter a valid Uzbekistan phone: +998 XX XXX XX XX'
          : 'Telefon raqamini to‘liq kiriting: +998 XX XXX XX XX',
    invalidName:
      language === 'ru'
        ? 'Введите ваше имя (минимум 2 буквы)'
        : language === 'en'
          ? 'Enter your full name (at least 2 characters)'
          : 'Ismingizni kiriting (kamida 2 harf)',
    otpSent:
      language === 'ru'
        ? `SMS-код отправлен (демо-код: ${BRAND_CONFIG.mockOtpCode})`
        : language === 'en'
          ? `SMS code sent (MVP demo code: ${BRAND_CONFIG.mockOtpCode})`
          : `SMS kod yuborildi (demo kod: ${BRAND_CONFIG.mockOtpCode})`,
    invalidOtp:
      language === 'ru'
        ? `Неверный код. Используйте демо-код: ${BRAND_CONFIG.mockOtpCode}`
        : language === 'en'
          ? `Invalid code. Use demo code: ${BRAND_CONFIG.mockOtpCode}`
          : `Noto‘g‘ri kod. Demo kod: ${BRAND_CONFIG.mockOtpCode}`,
    foundAccount:
      language === 'ru'
        ? 'Аккаунт найден:'
        : language === 'en'
          ? 'Account found:'
          : 'Hisob topildi:',
    registerBtn:
      language === 'ru'
        ? 'Получить код и зарегистрироваться'
        : language === 'en'
          ? 'Send code & register'
          : "Kod olish va ro'yxatdan o'tish",
    subtitle:
      language === 'ru'
        ? 'Сохраняйте избранные центры, сравнения и оставляйте проверенные отзывы.'
        : language === 'en'
          ? 'Save favorite centers, comparisons, and submit verified student reviews.'
          : 'Sevimli markazlarni saqlash, taqqoslashlar va tasdiqlangan sharh qoldirish uchun.',
  };

  const resetForm = () => {
    setMode('login');
    setStep('phone');
    setOtp('');
    setError('');
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidUzPhone(phone)) {
      setError(copy.invalidPhone);
      return;
    }
    if (mode === 'register' && name.trim().length < 2) {
      setError(copy.invalidName);
      return;
    }
    setError('');
    setStep('otp');
    pushToast(copy.otpSent, 'info');
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.trim() !== BRAND_CONFIG.mockOtpCode) {
      setError(copy.invalidOtp);
      return;
    }
    setError('');
    const effectiveUser = mode === 'login' ? matchedExisting : undefined;
    signInWithOtp({
      phone,
      name: effectiveUser?.name || name.trim() || (language === 'ru' ? 'Студент' : language === 'en' ? 'Student' : 'Foydalanuvchi'),
      role: effectiveUser?.role || role,
      cityId: effectiveUser?.cityId || cityId,
    });
    resetForm();
  };

  return (
    <AnimatePresence>
      {authModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          onClick={closeAuthModal}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-modal-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-2xl my-auto"
          >
            <button
              type="button"
              onClick={closeAuthModal}
              aria-label={t.common.close}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 id="auth-modal-title" className="font-display text-xl font-bold text-slate-900 dark:text-white pr-8">
              {t.auth.title}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">{copy.subtitle}</p>

            {/* Login vs Register Switcher */}
            {step === 'phone' && (
              <div className="mt-4 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError('');
                  }}
                  className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-lg text-xs font-semibold transition-all ${
                    mode === 'login'
                      ? 'bg-white dark:bg-slate-900 text-[#3B4CCA] dark:text-indigo-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span>{copy.loginTab}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError('');
                  }}
                  className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-lg text-xs font-semibold transition-all ${
                    mode === 'register'
                      ? 'bg-white dark:bg-slate-900 text-[#3B4CCA] dark:text-indigo-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>{copy.registerTab}</span>
                </button>
              </div>
            )}

            {step === 'phone' ? (
              <form onSubmit={handleSendOtp} className="mt-4 space-y-3.5">
                {mode === 'register' && (
                  <>
                    <div>
                      <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {t.auth.selectRole}
                      </span>
                      <div className="mt-1.5 grid grid-cols-2 gap-2">
                        {[
                          { id: UserRole.STUDENT, label: t.auth.roleStudent },
                          { id: UserRole.CENTER, label: t.auth.roleCenter },
                          { id: UserRole.TUTOR, label: t.auth.roleTutor },
                          { id: UserRole.ADMIN, label: t.auth.roleAdmin },
                        ].map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setRole(opt.id)}
                            className={`min-h-[40px] rounded-xl border px-3 py-2 text-left text-xs font-semibold transition-colors ${
                              role === opt.id
                                ? 'border-[#3B4CCA] bg-indigo-50 dark:bg-indigo-950/60 text-[#3B4CCA] dark:text-indigo-300'
                                : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="auth-name" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {t.auth.fullName}
                        </label>
                        <input
                          id="auth-name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Azizbek Karimov"
                          className="mt-1 w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-sm text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label htmlFor="auth-city" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {copy.regionLabel}
                        </label>
                        <select
                          id="auth-city"
                          value={cityId}
                          onChange={(e) => setCityId(e.target.value)}
                          className="mt-1 w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-xs font-medium text-slate-900 dark:text-white"
                        >
                          {CITIES.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name[language]}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label htmlFor="auth-phone" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {t.auth.phoneStep}
                  </label>
                  <div className="relative mt-1.5">
                    <Phone className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      id="auth-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(formatUzPhone(e.target.value))}
                      placeholder="+998 90 123 45 67"
                      className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 pl-10 pr-3.5 text-sm font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                  {mode === 'login' && matchedExisting && (
                    <p className="mt-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                      {copy.foundAccount} <strong>{matchedExisting.name}</strong>
                    </p>
                  )}
                </div>

                {error && <p className="text-xs font-medium text-rose-600 dark:text-rose-400">{error}</p>}

                <button
                  type="submit"
                  className="w-full h-11 rounded-xl bg-[#3B4CCA] text-sm font-semibold text-white hover:bg-[#2E3CA8] active:scale-[0.99] transition-all"
                >
                  {mode === 'register' ? copy.registerBtn : t.auth.sendCode}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    signInWithOtp({
                      phone: '+998 90 777 12 34',
                      name: name.trim() || 'Telegram User',
                      role,
                      cityId,
                      telegramHandle: '@uz_student',
                    });
                  }}
                  className="flex w-full h-10 items-center justify-center gap-2 rounded-xl border border-sky-200 dark:border-sky-800 bg-sky-50/70 dark:bg-sky-950/40 text-xs sm:text-sm font-semibold text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-950 transition-colors"
                >
                  <Send className="h-4 w-4" />
                  <span>{t.auth.telegramLogin}</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerify} className="mt-5 space-y-4">
                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-3 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{t.auth.otpHint}</span>
                </div>

                <div>
                  <label htmlFor="auth-otp" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {t.auth.otpStep} ({phone})
                  </label>
                  <input
                    id="auth-otp"
                    type="text"
                    inputMode="numeric"
                    autoFocus
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="mt-1.5 w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 text-center font-mono text-lg font-bold tracking-[0.35em] text-slate-900 dark:text-white"
                  />
                </div>

                {error && <p className="text-xs font-medium text-rose-600 dark:text-rose-400">{error}</p>}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('phone');
                      setError('');
                    }}
                    className="h-11 rounded-xl border border-slate-200 dark:border-slate-700 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    {t.common.back}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-11 rounded-xl bg-[#3B4CCA] text-sm font-semibold text-white hover:bg-[#2E3CA8]"
                  >
                    {t.auth.verifyAndEnter}
                  </button>
                </div>
              </form>
            )}

            <div className="mt-5 border-t border-slate-100 dark:border-slate-800 pt-4">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                <UserCheck className="h-3.5 w-3.5" />
                <span>{t.auth.quickDemo}</span>
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { role: UserRole.STUDENT, label: t.auth.roleStudent },
                  { role: UserRole.CENTER, label: t.auth.roleCenter },
                  { role: UserRole.TUTOR, label: t.auth.roleTutor },
                  { role: UserRole.ADMIN, label: t.auth.roleAdmin },
                ].map((item) => (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => quickDemoLogin(item.role)}
                    className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-[#3B4CCA] dark:hover:text-indigo-300 transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
