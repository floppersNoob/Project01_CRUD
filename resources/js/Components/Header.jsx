import React from 'react';
import { Link, usePage } from '@inertiajs/react';

const DPWHLogo = () => (
    <img 
        src="/assets/images/DPWH_logo.png" 
        alt="DPWH Logo" 
        className="w-12 h-12 object-contain"
    />
);

export default function Header() {
    const { auth } = usePage().props;

    return (
        <header className="fixed top-0 left-0 right-0 w-full bg-[#010066] shadow-sm border-b border-gray-200 z-50">
            <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Left Side - Logo */}
                    <div className="flex items-center">
                        <DPWHLogo />
                    </div>

                    {/* Center - Title */}
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <h1 className="text-xl font-semibold text-white">
                                Employee Profiling System
                            </h1>
                            <p className="text-xs text-gray-300">1ST DEO - District Engineering Office</p>
                        </div>
                    </div>

                    {/* Right Side - User Info */}
                    <div className="flex items-center space-x-4">
                        {/* Notifications */}
                        <button className="relative p-2 text-gray-300 hover:text-white transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>

                        {/* User Dropdown */}
                        <div className="flex items-center space-x-3">
                            <div className="text-right">
                                <p className="text-sm font-medium text-white">{auth.user.name}</p>
                                <p className="text-xs text-gray-300">Administrator</p>
                            </div>
                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                                <span className="text-[#010066] text-sm font-medium">
                                    {auth.user.name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
