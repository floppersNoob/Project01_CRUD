import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function UserLayout({ children }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [aboutModalOpen, setAboutModalOpen] = useState(false);
    const { url } = usePage();

    const isActive = (path) => url.startsWith(path);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Navigation Header */}
            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center">
                            <Link href="/employee-search" className="flex items-center group">
                                <div className="relative">
                                    <img
                                        src="/assets/images/DPWH_logo.png"
                                        alt="DPWH Logo"
                                        className="h-10 w-auto transition-transform group-hover:scale-105"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                        }}
                                    />
                                    <div className="hidden items-center justify-center w-10 h-10 bg-[#010066] rounded-lg">
                                        <span className="text-white font-bold text-sm">DPWH</span>
                                    </div>
                                </div>
                                <div className="ml-3">
                                    <span className="text-xl font-bold text-gray-900">Employee Directory</span>
                                    <span className="hidden sm:inline-block ml-2 text-xs text-gray-500 border-l border-gray-300 pl-2">
                                        DPWH
                                    </span>
                                </div>
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center space-x-1">
                            <NavLink href="/employee-search" active={isActive('/employee-search')}>
                                <svg
                                    className="w-4 h-4 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                                Search
                            </NavLink>
                            <button
                                onClick={() => setAboutModalOpen(true)}
                                className="flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            >
                                <svg
                                    className="w-4 h-4 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                About DPWH
                            </button>
                        </nav>

                        {/* Login & Mobile Menu */}
                        <div className="flex items-center space-x-4">
                            <Link
                                href="/login"
                                className="hidden sm:flex items-center px-4 py-2 bg-[#010066] text-white rounded-lg hover:bg-[#010066]/90 transition-colors font-medium text-sm"
                            >
                                <svg
                                    className="w-4 h-4 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                                    />
                                </svg>
                                Login
                            </Link>

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {mobileMenuOpen ? (
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    ) : (
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M4 6h16M4 12h16M4 18h16"
                                        />
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-gray-200 bg-white">
                        <div className="px-4 py-3 space-y-1">
                            <MobileNavLink href="/employee-search" active={isActive('/employee-search')}>
                                Search Employees
                            </MobileNavLink>
                            <MobileNavLink href="/quick-verify" active={isActive('/quick-verify')}>
                                Quick Verify
                            </MobileNavLink>
                            <button
                                onClick={() => {
                                    setMobileMenuOpen(false);
                                    setAboutModalOpen(true);
                                }}
                                className="w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                About DPWH
                            </button>
                            <Link
                                href="/login"
                                className="flex items-center px-4 py-3 mt-2 bg-[#010066] text-white rounded-lg font-medium"
                            >
                                Login
                            </Link>
                        </div>
                    </div>
                )}

                {/* About DPWH Modal */}
                {aboutModalOpen && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                            <div
                                className="fixed inset-0 transition-opacity"
                                onClick={() => setAboutModalOpen(false)}
                            >
                                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                            </div>
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                                <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
                                    {/* Vision */}
                                    <div className="mb-6">
                                        <h4 className="text-lg font-bold text-[#010066] mb-2">Vision</h4>
                                        <p className="text-gray-700 text-sm leading-relaxed">
                                            By 2040, DPWH is an excellent government agency, enabling a comfortable life
                                            for Filipinos through safe, reliable and resilient infrastructure.
                                        </p>
                                    </div>

                                    {/* Mission */}
                                    <div className="mb-6">
                                        <h4 className="text-lg font-bold text-[#010066] mb-2">Mission</h4>
                                        <p className="text-gray-700 text-sm leading-relaxed">
                                            To provide and manage quality infrastructure facilities and services responsive
                                            to the needs of the Filipino people in the pursuit of national development objectives.
                                        </p>
                                    </div>

                                    {/* Mandate */}
                                    <div className="mb-6">
                                        <h4 className="text-lg font-bold text-[#010066] mb-2">Mandate</h4>
                                        <p className="text-gray-700 text-sm leading-relaxed">
                                            The planning, design, construction and maintenance of infrastructure facilities,
                                            especially national highways, flood control and water resource development systems,
                                            and other public works in accordance with national development objectives.
                                        </p>
                                    </div>

                                    {/* Core Values */}
                                    <div>
                                        <h4 className="text-lg font-bold text-[#010066] mb-3">Core Values</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div className="bg-gray-50 p-3 rounded-lg">Public Service</div>
                                            <div className="bg-gray-50 p-3 rounded-lg">Integrity</div>
                                            <div className="bg-gray-50 p-3 rounded-lg">Professionalism</div>
                                            <div className="bg-gray-50 p-3 rounded-lg">Excellence</div>
                                            <div className="bg-gray-50 p-3 rounded-lg">Teamwork</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* DPWH Info */}
                        <div>
                            <div className="flex items-center mb-4">
                                <img
                                    src="/assets/images/DPWH_logo.png"
                                    alt="DPWH Logo"
                                    className="h-8 w-auto mr-3"
                                />
                                <div className="text-[#010066] font-bold text-lg leading-tight">DPWH</div>
                            </div>
                            <p className="text-gray-600 text-sm">Department of Public Works and Highways</p>
                            <p className="text-gray-500 text-xs mt-2">Employee Directory System</p>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
                            <ul className="space-y-2">
                                <li>
                                    <Link
                                        href="/employee-search"
                                        className="text-gray-600 hover:text-[#010066] text-sm transition-colors"
                                    >
                                        Search Employees
                                    </Link>
                                </li>
                                <li>
                                    <button
                                        onClick={() => setAboutModalOpen(true)}
                                        className="text-gray-600 hover:text-[#010066] text-sm transition-colors"
                                    >
                                        About DPWH
                                    </button>
                                </li>
                            </ul>
                        </div>

                        {/* Contact */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact</h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <p>
                                    <strong>Website:</strong> dpwh.gov.ph
                                </p>
                                <p>
                                    <strong>Phone:</strong>
                                </p>
                                <p>
                                    <strong>Address:</strong> DPWH Compound, Engineer's Hill, Bulua, Cagayan de Oro City, Misamis Oriental, 9000 Philippines
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
                        <p className="text-center md:text-left text-sm text-gray-500">
                            © {new Date().getFullYear()} Department of Public Works and Highways. All rights reserved.
                        </p>
                        <div className="flex items-center space-x-4 mt-4 md:mt-0">
                            <Link href="/privacy" className="text-sm text-gray-500 hover:text-gray-700">
                                Privacy Policy
                            </Link>
                            <Link href="/terms" className="text-sm text-gray-500 hover:text-gray-700">
                                Terms of Service
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function NavLink({ href, active, children }) {
    return (
        <Link
            href={href}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                active
                    ? 'bg-[#010066]/5 text-[#010066]'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
        >
            {children}
        </Link>
    );
}

function MobileNavLink({ href, active, children }) {
    return (
        <Link
            href={href}
            className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                active
                    ? 'bg-[#010066]/5 text-[#010066]'
                    : 'text-gray-600 hover:bg-gray-50'
            }`}
        >
            {children}
        </Link>
    );
}