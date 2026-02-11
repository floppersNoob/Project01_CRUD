import React, { useEffect, useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import UserLayout from '../../Layouts/UserLayout';

export default function QuickVerify({ employees, search, showArchived }) {
    const [searchTerm, setSearchTerm] = useState(search);
    const [searchResults, setSearchResults] = useState(employees);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const searchInputRef = useRef(null);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === '/') {
                e.preventDefault();
                searchInputRef.current?.focus();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => 
                    prev < searchResults.length - 1 ? prev + 1 : prev
                );
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
            } else if (e.key === 'Enter' && selectedIndex >= 0) {
                e.preventDefault();
                const selectedEmployee = searchResults[selectedIndex];
                if (selectedEmployee) {
                    router.get(`/employee/${selectedEmployee.id}`);
                }
            } else if (e.key === 'Escape') {
                setSelectedIndex(-1);
                searchInputRef.current?.blur();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [searchResults, selectedIndex]);

    // Debounced search
    useEffect(() => {
        if (searchTerm === search) return;

        const timeoutId = setTimeout(() => {
            setIsSearching(true);
            router.get(
                '/quick-verify',
                { search: searchTerm, archived: showArchived },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                    onFinish: () => setIsSearching(false),
                }
            );
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, showArchived]);

    const getStatusBadgeColor = (color) => {
        const colors = {
            green: 'bg-green-100 text-green-800',
            yellow: 'bg-yellow-100 text-yellow-800',
            blue: 'bg-blue-100 text-blue-800',
            red: 'bg-red-100 text-red-800',
            purple: 'bg-purple-100 text-purple-800',
            gray: 'bg-gray-100 text-gray-800',
            indigo: 'bg-indigo-100 text-indigo-800',
        };
        return colors[color] || colors.gray;
    };

    return (
        <UserLayout>
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Employee Quick Verify
                        </h1>
                        <p className="text-gray-600">
                            Instant employee verification for front desk
                        </p>
                        <div className="mt-4 text-sm text-gray-500">
                            Press <kbd className="px-2 py-1 bg-gray-100 rounded">/</kbd> to focus search • 
                            Use <kbd className="px-2 py-1 bg-gray-100 rounded">↑↓</kbd> to navigate • 
                            Press <kbd className="px-2 py-1 bg-gray-100 rounded">Enter</kbd> to view details
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="relative">
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by name, position, or department..."
                                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                                autoFocus
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            {isSearching && (
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                                </div>
                            )}
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={showArchived}
                                    onChange={(e) => {
                                        router.get(
                                            '/quick-verify',
                                            { search: searchTerm, archived: e.target.checked },
                                            { preserveState: false }
                                        );
                                    }}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-600">Show archived employees</span>
                            </label>
                            {searchResults.length > 0 && (
                                <span className="text-sm text-gray-500">
                                    {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Results */}
                    {searchResults.length > 0 ? (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            {searchResults.map((employee, index) => (
                                <div
                                    key={employee.id}
                                    className={`p-4 border-b border-gray-200 last:border-b-0 cursor-pointer transition-colors ${
                                        index === selectedIndex ? 'bg-blue-50' : 'hover:bg-gray-50'
                                    }`}
                                    onClick={() => router.get(`/employee/${employee.id}`)}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                    onMouseLeave={() => setSelectedIndex(-1)}
                                >
                                    <div className="flex items-center space-x-4">
                                        {/* Photo */}
                                        <div className="flex-shrink-0">
                                            {employee.photo_path ? (
                                                <img
                                                    src={`/storage/${employee.photo_path}`}
                                                    alt={employee.full_name}
                                                    className="h-12 w-12 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                                                    <span className="text-gray-600 font-medium">
                                                        {employee.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Employee Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-3">
                                                <h3 className="text-lg font-medium text-gray-900 truncate">
                                                    {employee.full_name}
                                                </h3>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(employee.status_badge.color)}`}>
                                                    {employee.status_badge.label}
                                                </span>
                                            </div>
                                            <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                                                <span className="flex items-center">
                                                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A9.002 9.002 0 0112 21a9.002 9.002 0 01-9-7.745M9 3a9.002 9.002 0 019 7.745M9 3v6m0 0h6m-6 0V3" />
                                                    </svg>
                                                    {employee.position}
                                                </span>
                                                <span className="flex items-center">
                                                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                    </svg>
                                                    {employee.section}
                                                </span>
                                                <span className="flex items-center">
                                                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    {employee.date_started}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Arrow */}
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : searchTerm ? (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
                            <p className="text-gray-500">Try adjusting your search terms</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Start searching</h3>
                            <p className="text-gray-500">Type an employee name, position, or department to begin</p>
                        </div>
                    )}
                </div>
            </div>
        </UserLayout>
    );
}
