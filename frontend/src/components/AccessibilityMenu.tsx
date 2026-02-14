'use client';

import { useState, useEffect } from 'react';

export default function AccessibilityMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const [highContrast, setHighContrast] = useState(false);
    const [fontSize, setFontSize] = useState(0); // -1, 0, 1, 2

    useEffect(() => {
        const savedContrast = localStorage.getItem('high-contrast') === 'true';
        const savedFontSize = parseInt(localStorage.getItem('font-size') || '0');

        if (savedContrast) {
            setHighContrast(true);
            document.documentElement.classList.add('high-contrast');
        }

        if (savedFontSize !== 0) {
            setFontSize(savedFontSize);
            updateFontSize(savedFontSize);
        }
    }, []);

    const toggleContrast = () => {
        const newValue = !highContrast;
        setHighContrast(newValue);
        localStorage.setItem('high-contrast', String(newValue));
        if (newValue) {
            document.documentElement.classList.add('high-contrast');
        } else {
            document.documentElement.classList.remove('high-contrast');
        }
    };

    const updateFontSize = (size: number) => {
        document.documentElement.classList.remove('font-size-lg', 'font-size-xl');
        if (size === 1) document.documentElement.classList.add('font-size-lg');
        if (size === 2) document.documentElement.classList.add('font-size-xl');
    };

    const changeFontSize = (delta: number) => {
        const newSize = Math.max(-1, Math.min(2, fontSize + delta));
        setFontSize(newSize);
        localStorage.setItem('font-size', String(newSize));
        updateFontSize(newSize);
    };

    return (
        <div className="fixed left-4 bottom-4 z-[100] flex flex-col items-start gap-2">
            {isOpen && (
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 shadow-2xl animate-fadeIn flex flex-col gap-3 mb-2 min-w-[200px]">
                    <div className="flex justify-between items-center mb-2 border-b border-[var(--border)] pb-2">
                        <h3 className="font-bold text-sm">Acessibilidade</h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:bg-[var(--border)] rounded-full transition-colors"
                            aria-label="Fechar menu de acessibilidade"
                        >
                            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <button
                        onClick={toggleContrast}
                        className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all ${highContrast ? 'bg-[var(--primary)] text-white' : 'hover:bg-[var(--border)]'
                            }`}
                    >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${highContrast ? 'bg-white/20' : 'bg-blue-500/20 text-blue-500'}`}>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                            </svg>
                        </div>
                        <span className="text-sm font-medium">Alto Contraste</span>
                    </button>

                    <div className="flex gap-2">
                        <button
                            onClick={() => changeFontSize(1)}
                            className="flex-1 flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-[var(--border)] transition-all border border-[var(--border)]"
                            aria-label="Aumentar fonte"
                        >
                            <span className="text-lg font-bold">A+</span>
                        </button>
                        <button
                            onClick={() => changeFontSize(-1)}
                            className="flex-1 flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-[var(--border)] transition-all border border-[var(--border)]"
                            aria-label="Diminuir fonte"
                        >
                            <span className="text-sm font-bold">A-</span>
                        </button>
                    </div>

                    <a
                        href="https://www.vlibras.gov.br/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-[var(--border)] transition-all"
                    >
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-500 flex items-center justify-center">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11" />
                            </svg>
                        </div>
                        <span className="text-sm font-medium">VLibras</span>
                    </a>
                </div>
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 z-[101] ${isOpen ? 'bg-red-500 rotate-90' : 'bg-blue-600'
                    }`}
                aria-label={isOpen ? "Fechar menu de acessibilidade" : "Abrir menu de acessibilidade"}
                title="Acessibilidade"
            >
                {isOpen ? (
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                )}
            </button>

            {/* Script for VLibras if desired, but for now just the button/link */}
        </div>
    );
}
