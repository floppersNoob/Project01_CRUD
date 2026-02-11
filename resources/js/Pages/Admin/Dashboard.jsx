import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';

export default function Dashboard({ stats, recentEmployees, employeesBySection, sections, employmentStatuses }) {


    
    return (
        <AdminLayout>
            {/* Custom Styles for DPWH Loading Animations */}
            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-8px); }
                }
                @keyframes circle-rotate {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes circle-pulse {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.1); }
                }
                @keyframes logo-glow {
                    0%, 100% { box-shadow: 0 0 20px rgba(1, 0, 102, 0.4); }
                    50% { box-shadow: 0 0 30px rgba(235, 53, 5, 0.6); }
                }
                .animate-circle-rotate {
                    animation: circle-rotate 3s linear infinite;
                }
                .animate-circle-rotate-reverse {
                    animation: circle-rotate 2s linear infinite reverse;
                }
                .animate-circle-pulse {
                    animation: circle-pulse 2s ease-in-out infinite;
                }
                .animate-logo-glow {
                    animation: logo-glow 3s ease-in-out infinite;
                }
                .animate-shimmer {
                    animation: shimmer 2.5s infinite;
                }
                .animate-float {
                    animation: float 4s ease-in-out infinite;
                }
                .animate-minimal-pulse {
                    animation: circle-pulse 2s ease-in-out infinite;
                }
            `}</style>
            
            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
                        <p className="text-sm text-gray-500 mt-1">View Data of Employees</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-r from-[#010066] to-[#010066] rounded-xl shadow-lg p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm font-medium">Total Employees</p>
                                <p className="text-3xl font-bold mt-2">{stats?.totalEmployees || 0}</p>
                                <p className="text-blue-100 text-xs mt-2">All registered employees</p>
                            </div>
                            <div className="bg-white/20 rounded-lg p-3">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-[#EB3505] to-[#EB3505] rounded-xl shadow-lg p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-100 text-sm font-medium">Active Employees</p>
                                <p className="text-3xl font-bold mt-2">{stats?.activeEmployees || 0}</p>
                                <p className="text-orange-100 text-xs mt-2">Currently employed</p>
                            </div>
                            <div className="bg-white/20 rounded-lg p-3">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-gray-600 to-gray-700 rounded-xl shadow-lg p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-100 text-sm font-medium">Archived Employees</p>
                                <p className="text-3xl font-bold mt-2">{stats?.archivedEmployees || 0}</p>
                                <p className="text-gray-100 text-xs mt-2">Former employees</p>
                            </div>
                            <div className="bg-white/20 rounded-lg p-3">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Sections Distribution Chart */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sections Distribution</h3>
                        <div className="space-y-3">
                            {Object.entries(employeesBySection || {}).map(([section, count], index) => {
                                const percentage = stats?.totalEmployees ? (count / stats.totalEmployees * 100).toFixed(1) : 0;
                                const colors = ['bg-[#010066]', 'bg-[#EB3505]', 'bg-gray-600', 'bg-gray-500', 'bg-gray-400'];
                                const color = colors[index % colors.length];
                                
                                return (
                                    <div key={section} className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium text-gray-700">{section}</span>
                                            <span className="text-gray-500">{count} ({percentage}%)</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div 
                                                className={`${color} h-2 rounded-full transition-all duration-500`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                            {Object.keys(employeesBySection || {}).length === 0 && (
                                <p className="text-gray-500 text-center py-4">No section data available</p>
                            )}
                        </div>
                    </div>

                    {/* Employment Status Chart */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Employment Status</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-center">
                                <div className="relative w-32 h-32">
                                    <svg className="w-32 h-32 transform -rotate-90">
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r="56"
                                            stroke="#e5e7eb"
                                            strokeWidth="16"
                                            fill="none"
                                        />
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r="56"
                                            stroke="#EB3505"
                                            strokeWidth="16"
                                            fill="none"
                                            strokeDasharray={`${(stats?.activeEmployees || 0) * 2 * Math.PI * 56 / (stats?.totalEmployees || 1)} ${2 * Math.PI * 56}`}
                                            className="transition-all duration-500"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-gray-900">{stats?.activeEmployees || 0}</p>
                                            <p className="text-xs text-gray-500">Active</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 bg-[#EB3505] rounded-full mr-2"></div>
                                        <span className="text-gray-700">Active</span>
                                    </div>
                                    <span className="font-medium">{stats?.activeEmployees || 0}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 bg-gray-300 rounded-full mr-2"></div>
                                        <span className="text-gray-700">Archived</span>
                                    </div>
                                    <span className="font-medium">{stats?.archivedEmployees || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Employee Count by Section Chart */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Count by Section</h3>
                        <div className="space-y-3">
                            {Object.entries(employeesBySection || {})
                                .sort(([,a], [,b]) => b - a)
                                .slice(0, 6)
                                .map(([section, count]) => {
                                    const maxCount = Math.max(...Object.values(employeesBySection || {}));
                                    const barHeight = maxCount ? (count / maxCount * 100) : 0;
                                    
                                    return (
                                        <div key={section} className="flex items-center space-x-3">
                                            <div className="w-20 text-sm font-medium text-gray-700 truncate">
                                                {section.length > 12 ? section.substring(0, 12) + '...' : section}
                                            </div>
                                            <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                                                <div 
                                                    className="bg-gradient-to-r from-[#010066] to-[#EB3505] h-4 rounded-full transition-all duration-500"
                                                    style={{ width: `${barHeight}%` }}
                                                />
                                            </div>
                                            <div className="w-8 text-sm font-bold text-gray-900 text-right">
                                                {count}
                                            </div>
                                        </div>
                                    );
                                })}
                            {Object.keys(employeesBySection || {}).length === 0 && (
                                <p className="text-gray-500 text-center py-4">No data available</p>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
}
